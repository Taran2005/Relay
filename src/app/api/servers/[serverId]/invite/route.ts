import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";


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

        const inviteCode = uuidv4();

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