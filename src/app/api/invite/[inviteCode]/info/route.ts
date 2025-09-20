import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ inviteCode: string }> }
) {
    try {
        const { inviteCode } = await params;

        const server = await db.server.findFirst({
            where: {
                inviteCode,
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        if (!server) {
            return new NextResponse("Invite code not found", { status: 404 });
        }

        return NextResponse.json(server);
    } catch (error) {
        console.log("[INVITE_INFO_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}