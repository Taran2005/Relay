"use client";

import { UserAvatar } from "@/components/user-avatar";
import { ChannelType } from "@prisma/client";
import { Hash, Mic, Video } from "lucide-react";

interface ChatHeaderProps {
    name: string;
    type: 'channel' | 'conversation';
    imageUrl?: string | null;
    channelType?: ChannelType;
}

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
};

export const ChatHeader = ({ name, type, imageUrl, channelType }: ChatHeaderProps) => {
    const Icon = channelType ? iconMap[channelType] : null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
                {type === 'channel' && Icon && (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                )}
                {type === 'conversation' && imageUrl && (
                    <UserAvatar src={imageUrl} className="h-8 w-8" />
                )}
                <h1 className="text-lg font-semibold text-foreground truncate">
                    {type === 'channel' ? `#${name}` : name}
                </h1>
            </div>
            <div className="flex items-center space-x-2">
                {/* Call functionality removed */}
            </div>
        </div>
    );
};