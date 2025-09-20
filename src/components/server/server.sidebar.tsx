"use client";

import { useServerData } from "@/lib/hooks/useServerData";
import { useUser } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { ServerHeader } from "./server.header";

interface ServerSidebarProps {
    serverId: string;
}

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
    const { user } = useUser();
    const { server, isLoading, error } = useServerData(serverId);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !server) {
        return <div>Error loading server</div>;
    }

    const textChannels = server.channels?.filter(channel => channel.type === ChannelType.TEXT);
    const voiceChannels = server.channels?.filter(channel => channel.type === ChannelType.AUDIO);
    const videoChannels = server.channels?.filter(channel => channel.type === ChannelType.VIDEO);
    const members = server.members?.filter(member => member.profileId !== user?.id);

    const role = server.members?.find(member => member.profile.userId === user?.id)?.role;

    return (
        <div className="w-full h-full">
            <ServerHeader server={server} role={role} />
            {/* TODO: Render channels and members */}
        </div>
    );
};
