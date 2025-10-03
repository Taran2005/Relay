import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIDPageProps {
    params: Promise<{ serverId: string }>;
}

const ServerIDPage = async ({ params }: ServerIDPageProps) => {
    const { serverId } = await params;

    const profile = await currentProfile();
    if (!profile) {
        return redirect("/sign-in");
    }

    // Check if user is a member of the server
    const member = await db.member.findFirst({
        where: {
            serverId,
            profileId: profile.id,
        },
    });

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                where: {
                    type: "TEXT",
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    // If server doesn't exist or user is not a member and not the creator
    if (!server || (!member && server.creatorId !== profile.id)) {
        return redirect("/");
    }

    // Find the general channel (first text channel)
    const generalChannel = server.channels[0];

    if (generalChannel) {
        return redirect(`/servers/${serverId}/channels/${generalChannel.id}`);
    }

    // If no channels exist, redirect to home
    return redirect("/");
};

export default ServerIDPage;
