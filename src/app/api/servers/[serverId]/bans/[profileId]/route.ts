import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | string[] }> }
) {
    try {
        const paramsData = await params;
        const { serverId, profileId } = paramsData as { serverId: string; profileId: string };

        // Check if user is banned from this server
        const ban = await db.ban.findFirst({
            where: {
                serverId,
                profileId,
            },
        });

        if (ban) {
            return new NextResponse("User is banned", { status: 200 });
        }

        return new NextResponse("User is not banned", { status: 404 });
    } catch (error) {
        logger.error("[BAN_CHECK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}