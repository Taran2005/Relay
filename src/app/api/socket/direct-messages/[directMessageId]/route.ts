import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getSocketServer } from "@/lib/socket";

async function handler(
    req: Request,
    { params }: { params: Promise<{ directMessageId: string }> }
) {
    const { directMessageId } = await params;
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return new NextResponse("Method not allowed", { status: 405 });
    }

    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const conversationId = searchParams.get("conversationId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!conversationId) {
            return new NextResponse("Conversation ID missing", { status: 400 });
        }

        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    {
                        memberOne: {
                            profileId: profile.id,
                        }
                    },
                    {
                        memberTwo: {
                            profileId: profile.id,
                        }
                    }
                ]
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
            return new NextResponse("Conversation not found", { status: 404 });
        }

        let directMessage = await db.directMessage.findFirst({
            where: {
                id: directMessageId,
                conversationId: conversationId,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        if (!directMessage || directMessage.deleted) {
            return new NextResponse("Message not found", { status: 404 });
        }

        const isMessageOwner = directMessage.memberId === conversation.memberOneId || directMessage.memberId === conversation.memberTwoId;
        const member = directMessage.memberId === conversation.memberOneId ? conversation.memberOne : conversation.memberTwo;

        if (!isMessageOwner || member.profileId !== profile.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (req.method === "DELETE") {
            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId,
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted.",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });

            const io = getSocketServer();
            if (io) {
                const updateKey = `chat:${conversationId}:messages:update`;
                const channelKey = `chat:${conversationId}:messages`;
                io.to(channelKey).emit(updateKey, directMessage);
            }
        }

        if (req.method === "PATCH") {
            const { content } = await req.json();

            if (!content) {
                return new NextResponse("Content missing", { status: 400 });
            }

            directMessage = await db.directMessage.update({
                where: {
                    id: directMessageId,
                },
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
            });

            const io = getSocketServer();
            if (io) {
                const updateKey = `chat:${conversationId}:messages:update`;
                const channelKey = `chat:${conversationId}:messages`;
                io.to(channelKey).emit(updateKey, directMessage);
            }
        }

        return NextResponse.json(directMessage);
    } catch (error) {
        logger.error("[MESSAGE_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export { handler as DELETE, handler as PATCH };

