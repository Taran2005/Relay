import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
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

        const server = await db.server.findUnique({
            where: {
                id: serverId,
            },
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Check if user is a member
        const member = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (!member) {
            return new NextResponse("Not a member", { status: 400 });
        }

        if (member.role === "ADMIN") {
            return new NextResponse("Admin cannot leave server", { status: 400 });
        }

        await db.member.delete({
            where: {
                id: member.id,
            },
        });

        return NextResponse.json({ message: "Left server successfully" });
    } catch (error) {
        console.log("[SERVER_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}