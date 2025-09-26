import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// ✅ Input validation schemas
const GetServersSchema = z.object({
    memberId: z.string().uuid("Invalid member ID format"),
});

const CreateServerSchema = z.object({
    name: z
        .string()
        .min(3, "Server name must be at least 3 characters")
        .max(30, "Server name must be at most 30 characters")
        .trim(),
    imageUrl: z.string().url().nullable().optional(),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const rawMemberId = searchParams.get("memberId");

        // ✅ Validate input
        const { memberId } = GetServersSchema.parse({ memberId: rawMemberId });

        // ✅ Check authentication
        const profile = await currentProfile();
        if (!profile) {
            return NextResponse.json(
                { error: "Unauthorized", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        // ✅ Verify member belongs to current profile
        if (profile.id !== memberId) {
            return NextResponse.json(
                { error: "Forbidden", code: "FORBIDDEN" },
                { status: 403 }
            );
        }

        const servers = await db.server.findMany({
            where: {
                members: {
                    some: {
                        profileId: memberId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        profile: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                channels: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.error("[SERVERS_GET_ERROR]", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request parameters", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // ✅ Parse and validate request body
        const body = await req.json();
        const { name, imageUrl } = CreateServerSchema.parse(body);

        // ✅ Check authentication
        const profile = await currentProfile();
        if (!profile) {
            return NextResponse.json(
                { error: "Unauthorized", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        // ✅ Create server with transaction for consistency
        const newServer = await db.$transaction(async (tx) => {
            const server = await tx.server.create({
                data: {
                    id: uuidv4(),
                    name,
                    imageUrl: imageUrl || null,
                    inviteCode: uuidv4(),
                    creatorId: profile.id,
                    channels: {
                        create: [
                            {
                                name: "general",
                                type: "TEXT", // Add explicit channel type
                            },
                        ],
                    },
                    members: {
                        create: {
                            profileId: profile.id,
                            role: MemberRole.ADMIN,
                        },
                    },
                },
                include: {
                    members: {
                        include: {
                            profile: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                    channels: true,
                },
            });

            return server;
        });

        return NextResponse.json(newServer, { status: 201 });
    } catch (error) {
        console.error("[SERVERS_POST_ERROR]", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}