import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ChannelType, MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ serverId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId } = await params;
        const { name, type } = await req.json();

        if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
            return new NextResponse("Invalid channel name", { status: 400 });
        }

        if (!type || !Object.values(ChannelType).includes(type)) {
            return new NextResponse("Invalid channel type", { status: 400 });
        }

        // Check if user is a member with appropriate role
        const member = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (!member) {
            return new NextResponse("Not a member", { status: 403 });
        }

        if (member.role !== MemberRole.ADMIN && member.role !== MemberRole.MODERATOR) {
            return new NextResponse("Insufficient permissions", { status: 403 });
        }

        const channel = await db.channel.create({
            data: {
                name: name.trim(),
                type,
                serverId,
            },
        });

        return NextResponse.json(channel);
    } catch (error) {
        logger.error("[CHANNELS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}