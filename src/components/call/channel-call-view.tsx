"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useCallSession } from "@/hooks/use-call-session";
import type { CallTarget } from "@/lib/hooks/use-call-store";
import { CallRoom } from "./call-room";

interface ChannelCallViewProps {
    channelId: string;
    serverId: string;
    channelName: string;
    startVideo?: boolean;
}

export const ChannelCallView = ({ channelId, serverId, channelName, startVideo }: ChannelCallViewProps) => {
    const target = useMemo<CallTarget>(
        () => ({
            type: "channel",
            targetId: channelId,
            serverId,
            startVideo,
            title: channelName,
        }),
        [channelId, serverId, channelName, startVideo]
    );

    const { status, data, error, refresh } = useCallSession({
        active: true,
        target,
    });

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {status === "loading" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Connecting to {channelName}…</p>
                </div>
            )}
            {status === "error" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <p className="text-sm">{error ?? "We couldn't connect to the call."}</p>
                    <Button onClick={refresh} className="gap-2">
                        <RefreshCcw className="h-4 w-4" /> Try again
                    </Button>
                </div>
            )}
            {status === "ready" && data && (
                <div className="flex-1 min-h-0">
                    <CallRoom
                        token={data.token}
                        serverUrl={data.url}
                        startVideo={startVideo ?? data.startVideo}
                    />
                </div>
            )}
        </div>
    );
};
