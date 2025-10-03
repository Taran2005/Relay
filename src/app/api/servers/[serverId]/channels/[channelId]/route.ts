import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | string[] }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const paramsData = await params;
        const { serverId, channelId } = paramsData as { serverId: string; channelId: string };
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

        // Check if channel exists and belongs to the server
        const channel = await db.channel.findFirst({
            where: {
                id: channelId,
                serverId,
            },
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        // Prevent editing "general" channel
        if (channel.name === "general") {
            return new NextResponse("Cannot edit general channel", { status: 400 });
        }

        const updatedChannel = await db.channel.update({
            where: {
                id: channelId,
            },
            data: {
                name: name.trim(),
                type,
            },
        });

        return NextResponse.json(updatedChannel);
    } catch (error) {
        console.error("[CHANNEL_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { serverId, channelId } = await params;

        // Check if user is a member with admin role
        const member = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            },
        });

        if (!member) {
            return new NextResponse("Not a member", { status: 403 });
        }

        if (member.role !== MemberRole.ADMIN) {
            return new NextResponse("Insufficient permissions", { status: 403 });
        }

        // Check if channel exists and belongs to the server
        const channel = await db.channel.findFirst({
            where: {
                id: channelId,
                serverId,
            },
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        // Prevent deleting "general" channel
        if (channel.name === "general") {
            return new NextResponse("Cannot delete general channel", { status: 400 });
        }

        await db.channel.delete({
            where: {
                id: channelId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[CHANNEL_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}