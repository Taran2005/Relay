import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get("memberId");

        if (!memberId) {
            return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
        }

        const profile = await currentProfile();
        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const servers = await db.server.findMany({
            where: {
                members: {
                    some: {
                        profileId: memberId
                    }
                }
            },
            include: {
                members: true
            }
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.error("Error fetching servers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, imageUrl } = await req.json();
        if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 30) {
            return NextResponse.json({ error: "Invalid server name" }, { status: 400 });
        }
        const profile = await currentProfile();
        if (!profile) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const newServer = await db.server.create({
            data: {
                id: uuidv4(),
                name: name.trim(),
                imageUrl: imageUrl || null,
                inviteCode: uuidv4(),
                creatorId: profile.id,
                channels: {
                    create: [
                        {
                            name: "general",
                        }
                    ]
                },
                members: {
                    create: {
                        profileId: profile.id,
                        role: MemberRole.ADMIN,
                    }
                }
            }
        });
        return NextResponse.json(newServer);
    } catch (error) {
        console.error("Error creating server:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 