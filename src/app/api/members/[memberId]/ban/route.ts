import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { memberId } = await params;

        // Check if the current user is an admin of the server
        const memberToBan = await db.member.findUnique({
            where: {
                id: memberId,
            },
            include: {
                server: true,
            },
        });

        if (!memberToBan) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const currentUserMember = await db.member.findFirst({
            where: {
                serverId: memberToBan.serverId,
                profileId: profile.id,
            },
        });

        if (!currentUserMember || currentUserMember.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Cannot ban yourself
        if (memberToBan.profileId === profile.id) {
            return new NextResponse("Cannot ban yourself", { status: 400 });
        }

        // Cannot ban other admins
        if (memberToBan.role === "ADMIN") {
            return new NextResponse("Cannot ban admin", { status: 400 });
        }

        // Check if already banned
        const existingBan = await db.ban.findFirst({
            where: {
                serverId: memberToBan.serverId,
                profileId: memberToBan.profileId,
            },
        });

        if (existingBan) {
            return new NextResponse("User is already banned", { status: 400 });
        }

        // Create the ban
        await db.ban.create({
            data: {
                serverId: memberToBan.serverId,
                profileId: memberToBan.profileId,
            },
        });

        return new NextResponse("Member banned successfully", { status: 200 });
    } catch (error) {
        console.log("[MEMBER_BAN_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}