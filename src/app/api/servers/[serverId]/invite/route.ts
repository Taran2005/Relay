import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";


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

        const member = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (!member) {
            return new NextResponse("Server not found", { status: 404 });
        }

        if (member.role !== MemberRole.ADMIN && member.role !== MemberRole.MODERATOR) {
            return new NextResponse("Forbidden", { status: 403 });
        }
        
        const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const server = await db.server.update({
            where: {
                id: serverId,
            },
            data: {
                inviteCode,
            },
        });
        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVER_INVITE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}