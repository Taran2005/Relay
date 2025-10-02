import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.LIVEKIT_HOST;

interface CallTokenRequest {
    targetType: "channel" | "conversation";
    targetId: string;
    serverId?: string;
    startVideo?: boolean;
}

const UNCONFIGURED_RESPONSE = NextResponse.json(
    {
        error: "LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.",
    },
    { status: 503 }
);

export async function POST(request: Request) {
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
        return UNCONFIGURED_RESPONSE;
    }

    try {
        const profile = await currentProfile();

        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json()) as Partial<CallTokenRequest>;
        const { targetType, targetId, serverId, startVideo } = body;

        if (!targetType || !targetId) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        let roomName: string;
        let friendlyName: string | null = null;

        if (targetType === "channel") {
            if (!serverId) {
                return NextResponse.json({ error: "Server ID is required for channel calls" }, { status: 400 });
            }

            const channel = await db.channel.findFirst({
                where: {
                    id: targetId,
                    serverId,
                    server: {
                        members: {
                            some: {
                                profileId: profile.id,
                            },
                        },
                        bans: {
                            none: {
                                profileId: profile.id,
                            },
                        },
                    },
                },
                include: {
                    server: true,
                },
            });

            if (!channel) {
                return NextResponse.json({ error: "Channel not found or access denied" }, { status: 404 });
            }

            roomName = `server_${serverId}_channel_${channel.id}`;
            friendlyName = channel.name;
        } else {
            const conversation = await db.conversation.findFirst({
                where: {
                    id: targetId,
                    OR: [
                        { memberOne: { profileId: profile.id } },
                        { memberTwo: { profileId: profile.id } },
                    ],
                },
                include: {
                    memberOne: {
                        include: {
                            profile: true,
                        },
                    },
                    memberTwo: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });

            if (!conversation) {
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }

            roomName = `conversation_${conversation.id}`;

            const otherProfile =
                conversation.memberOne.profileId === profile.id
                    ? conversation.memberTwo.profile
                    : conversation.memberOne.profile;

            friendlyName = otherProfile?.name ?? null;
        }

        const ttlSeconds = 60 * 60; // 1 hour
        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            ttl: ttlSeconds,
            identity: profile.id,
            metadata: JSON.stringify({
                profileId: profile.id,
                name: profile.name,
                email: profile.email,
            }),
        });

        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        return NextResponse.json({
            token: token.toJwt(),
            url: LIVEKIT_URL,
            roomName,
            identity: profile.id,
            participantName: profile.name,
            startVideo: Boolean(startVideo),
            friendlyName,
        });
    } catch (error) {
        console.error("[LIVEKIT_TOKEN_POST]", error);
        return NextResponse.json({ error: "Failed to create LiveKit token" }, { status: 500 });
    }
}
