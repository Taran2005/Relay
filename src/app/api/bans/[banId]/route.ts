import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ banId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { banId } = await params;

        // Check if the ban exists and get the server
        const ban = await db.ban.findUnique({
            where: {
                id: banId,
            },
            include: {
                server: true,
            },
        });

        if (!ban) {
            return new NextResponse("Ban not found", { status: 404 });
        }

        // Check if the current user is an admin of the server
        const currentUserMember = await db.member.findFirst({
            where: {
                serverId: ban.serverId,
                profileId: profile.id,
            },
        });

        if (!currentUserMember || currentUserMember.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Delete the ban
        await db.ban.delete({
            where: {
                id: banId,
            },
        });

        return new NextResponse("Ban removed successfully", { status: 200 });
    } catch (error) {
        logger.error("[BAN_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}