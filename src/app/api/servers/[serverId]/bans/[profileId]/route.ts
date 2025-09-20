import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ serverId: string; profileId: string }> }
) {
    try {
        const { serverId, profileId } = await params;

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
        console.log("[BAN_CHECK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}