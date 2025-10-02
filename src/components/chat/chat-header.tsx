"use client";

import { ActionTooltip } from "@/components/action.tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { useCallStore } from "@/lib/hooks/use-call-store";
import { ChannelType } from "@prisma/client";
import { Hash, Mic, Phone, Video } from "lucide-react";

interface ChatHeaderProps {
    name: string;
    type: 'channel' | 'conversation';
    imageUrl?: string | null;
    channelType?: ChannelType;
    callContext?: {
        target: {
            type: 'channel' | 'conversation';
            targetId: string;
            serverId?: string;
            title?: string | null;
        };
        allowVideo?: boolean;
    };
}

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
};

export const ChatHeader = ({ name, type, imageUrl, channelType, callContext }: ChatHeaderProps) => {
    const Icon = channelType ? iconMap[channelType] : null;
    const openCall = useCallStore((state) => state.open);

    const handleVoiceCall = () => {
        if (!callContext) return;
        openCall({
            ...callContext.target,
            startVideo: false,
            title: callContext.target.title ?? name,
        });
    };

    const handleVideoCall = () => {
        if (!callContext) return;
        openCall({
            ...callContext.target,
            startVideo: true,
            title: callContext.target.title ?? name,
        });
    };

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
                {callContext && (
                    <>
                        <ActionTooltip label="Call">
                            <button
                                type="button"
                                onClick={handleVoiceCall}
                                className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                                aria-label="Start voice call"
                                data-testid="chat-header-voice-call"
                            >
                                <Phone className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </ActionTooltip>
                        {callContext.allowVideo !== false && (
                            <ActionTooltip label="Video call">
                                <button
                                    type="button"
                                    onClick={handleVideoCall}
                                    className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                                    aria-label="Start video call"
                                    data-testid="chat-header-video-call"
                                >
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </ActionTooltip>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};