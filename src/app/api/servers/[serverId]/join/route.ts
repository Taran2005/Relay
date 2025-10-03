import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId } = await params;

        // Check if server exists
        const server = await db.server.findUnique({
            where: {
                id: serverId,
            },
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Check if user is already a member
        const existingMember = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (existingMember) {
            return new NextResponse("Already a member", { status: 400 });
        }

        // Check if user is banned
        const ban = await db.ban.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (ban) {
            return new NextResponse("You are banned from this server", { status: 403 });
        }

        // Add user as a member
        const member = await db.member.create({
            data: {
                serverId,
                profileId: profile.id,
                role: "GUEST",
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        logger.error("[SERVER_JOIN_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}