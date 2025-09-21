"use client";

import { useServerData } from "@/lib/hooks/useServerData";
import { useUser } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ServerHeader } from "./server.header";
import { Skeleton } from "@/components/ui/skeleton";

interface ServerSidebarProps {
    serverId: string;
}

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

    return (
        <div className="flex h-full w-full flex-col bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-2xl relative overflow-hidden rounded-r-3xl mr-2">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
            <ServerHeader server={server} role={role} />

            {/* Channels Section */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {textChannels && textChannels.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Text Channels</h3>
                        {textChannels.map(channel => (
                            <div key={channel.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <span className="text-sm text-foreground">{channel.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                {voiceChannels && voiceChannels.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Voice Channels</h3>
                        {voiceChannels.map(channel => (
                            <div key={channel.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <span className="text-sm text-foreground">{channel.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                {videoChannels && videoChannels.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Video Channels</h3>
                        {videoChannels.map(channel => (
                            <div key={channel.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <span className="text-sm text-foreground">{channel.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Members Section */}
            <div className="p-4 border-t border-border/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Members</h3>
                {members && members.map(member => (
                    <div key={member.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-sm text-foreground">{member.profile.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
