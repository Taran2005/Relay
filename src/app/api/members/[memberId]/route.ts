import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | string[] }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const paramsData = await params;
        const memberId = paramsData.memberId as string;

        // Check if the current user is an admin of the server
        const memberToKick = await db.member.findUnique({
            where: {
                id: memberId,
            },
            include: {
                server: true,
            },
        });

        if (!memberToKick) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const currentUserMember = await db.member.findFirst({
            where: {
                serverId: memberToKick.serverId,
                profileId: profile.id,
            },
        });

        if (!currentUserMember || currentUserMember.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Cannot kick yourself
        if (memberToKick.profileId === profile.id) {
            return new NextResponse("Cannot kick yourself", { status: 400 });
        }

        // Cannot kick other admins
        if (memberToKick.role === "ADMIN") {
            return new NextResponse("Cannot kick admin", { status: 400 });
        }

        // Delete the member
        await db.member.delete({
            where: {
                id: memberId,
            },
        });

        return new NextResponse("Member kicked successfully", { status: 200 });
    } catch (error) {
        console.log("[MEMBER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const paramsData = await params;
        const memberId = paramsData.memberId as string;
        const { role } = await req.json();

        // Check if the current user is an admin of the server
        const memberToUpdate = await db.member.findUnique({
            where: {
                id: memberId,
            },
            include: {
                server: true,
            },
        });

        if (!memberToUpdate) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const currentUserMember = await db.member.findFirst({
            where: {
                serverId: memberToUpdate.serverId,
                profileId: profile.id,
            },
        });

        if (!currentUserMember || currentUserMember.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Cannot change your own role
        if (memberToUpdate.profileId === profile.id) {
            return new NextResponse("Cannot change your own role", { status: 400 });
        }

        // Cannot change other admins' roles
        if (memberToUpdate.role === "ADMIN") {
            return new NextResponse("Cannot change admin role", { status: 400 });
        }

        // Update the member's role
        await db.member.update({
            where: {
                id: memberId,
            },
            data: {
                role,
            },
        });

        return new NextResponse("Role updated successfully", { status: 200 });
    } catch (error) {
        console.log("[MEMBER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}