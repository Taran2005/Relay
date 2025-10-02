"use client";

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";

interface CallRoomProps {
    token: string;
    serverUrl: string;
    startVideo?: boolean;
    onDisconnected?: () => void;
}

export const CallRoom = ({ token, serverUrl, startVideo, onDisconnected }: CallRoomProps) => {
    return (
        <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            connectOptions={{ autoSubscribe: true }}
            audio
            video={startVideo}
            onDisconnected={onDisconnected}
            className="flex flex-col h-full"
            data-lk-theme="default"
        >
            <RoomAudioRenderer />
            <VideoConference />
        </LiveKitRoom>
    );
};
