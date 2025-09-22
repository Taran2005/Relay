"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServerData } from "@/lib/hooks/useServerData";
import { useUser } from "@clerk/nextjs";
import { ChannelType, MemberRole } from "@prisma/client";
import { Crown, Hash, Mic, ShieldCheck, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ServerHeader } from "./server.header";
import { ServerSearch } from "./server.search";

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 w-4 h-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 w-4 h-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 w-4 h-4" />,
};

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <Crown className="h-4 w-4 mr-2 text-yellow-500" />
};

export const ServerSidebar = ({ serverId }: ServerSidebarProps) => {
    const { user } = useUser();
    const { server, isLoading, error } = useServerData(serverId);
    const router = useRouter();

    const isMember = server?.members?.some(member => member.profile.userId === user?.id);
    const isCreator = server?.creatorId === user?.id;

    useEffect(() => {
        // If server doesn't exist (404) or user is not a member and not creator, redirect
        if (!isLoading && (!server || (!isMember && !isCreator))) {
            router.push("/");
        }
    }, [isLoading, server, isMember, isCreator, router]);

    if (isLoading) {
        return (
            <div className="flex h-full w-full flex-col bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-2xl relative overflow-hidden rounded-r-3xl mr-2">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
                {/* Header Skeleton */}
                <div className="p-4 border-b border-border/50">
                    <Skeleton className="h-6 w-32 bg-muted" />
                </div>
                {/* Channels Section Skeleton */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2 bg-muted" />
                        <Skeleton className="h-8 w-full mb-1 bg-muted" />
                        <Skeleton className="h-8 w-full mb-1 bg-muted" />
                        <Skeleton className="h-8 w-full bg-muted" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-2 bg-muted" />
                        <Skeleton className="h-8 w-full mb-1 bg-muted" />
                        <Skeleton className="h-8 w-full bg-muted" />
                    </div>
                </div>
                {/* Members Section Skeleton */}
                <div className="p-4 border-t border-border/50">
                    <Skeleton className="h-4 w-16 mb-2 bg-muted" />
                    <Skeleton className="h-8 w-full mb-1 bg-muted" />
                    <Skeleton className="h-8 w-full mb-1 bg-muted" />
                    <Skeleton className="h-8 w-full bg-muted" />
                </div>
            </div>
        );
    }

    if (error || !server) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-background/95 backdrop-blur-xl border-r border-border/50 text-center p-4">
                <div className="text-red-500 text-lg font-semibold mb-2">Not Authorized</div>
                <p className="text-muted-foreground text-sm">
                    You are no longer a member of this server.
                </p>
            </div>
        );
    }

    const textChannels = server.channels?.filter(channel => channel.type === ChannelType.TEXT);
    const voiceChannels = server.channels?.filter(channel => channel.type === ChannelType.AUDIO);
    const videoChannels = server.channels?.filter(channel => channel.type === ChannelType.VIDEO);
    const members = server.members?.filter(member => member.profileId !== user?.id);
    const role = server.members?.find(member => member.profile.userId === user?.id)?.role;

    const searchData = [
        {
            label: "Text Channels",
            type: "channel" as const,
            data: textChannels?.map(channel => ({
                icon: iconMap[channel.type],
                name: channel.name,
                id: channel.id,
            })) || []
        },
        {
            label: "Voice Channels",
            type: "channel" as const,
            data: voiceChannels?.map(channel => ({
                icon: iconMap[channel.type],
                name: channel.name,
                id: channel.id,
            })) || []
        },
        {
            label: "Video Channels",
            type: "channel" as const,
            data: videoChannels?.map(channel => ({
                icon: iconMap[channel.type],
                name: channel.name,
                id: channel.id,
            })) || []
        },
        {
            label: "Members",
            type: "member" as const,
            data: members?.map(member => ({
                icon: roleIconMap[member.role],
                name: member.profile.name,
                id: member.id,
            })) || []
        }
    ];

    return (
        <div className="flex h-full w-full flex-col bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-2xl relative overflow-hidden rounded-r-3xl mr-2">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
            <ServerHeader server={server} role={role} />

            {/* Search Component */}
            <div className="p-2">
                <ServerSearch data={searchData} serverId={serverId} />
            </div>

        </div>
    );
};
