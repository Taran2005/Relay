"use client";

import { useEffect, useState } from "react";

import { LiveKitRoom, VideoConference, RoomAudioRenderer, useParticipants, useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "@livekit/components-styles";

import { useProfile } from "@/hooks/use-profile";

import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  onLeave?: () => void;
}

const AudioRoom = ({ onLeave }: { onLeave?: () => void }) => {
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Debug: log participant info
  console.log('Participants:', participants.map(p => ({
    sid: p.sid,
    identity: p.identity,
    name: p.name,
    metadata: p.metadata
  })));

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="text-xl mb-4">🎤 Voice Channel</div>
      <div className="text-sm text-gray-300 mb-2">
        Status: {connectionState === ConnectionState.Connected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>
      <div className="text-sm text-gray-300 mb-4">
        Participants: {participants.length}
      </div>
      {participants.length > 0 && (
        <div className="text-sm text-gray-400 mb-4">
          <div className="mb-2">In call:</div>
          {participants.map((participant) => (
            <div key={participant.sid} className="flex items-center gap-2">
              <span>👤 {participant.identity || 'Anonymous'}</span>
              {participant.isSpeaking && <span className="text-green-400">🎙️</span>}
            </div>
          ))}
        </div>
      )}
      {onLeave && (
        <button
          onClick={onLeave}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Leave Call
        </button>
      )}
      <RoomAudioRenderer />
    </div>
  );
};

export const MediaRoom = ({ chatId, video, audio, onLeave }: MediaRoomProps) => {
  const { data: profile } = useProfile();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!profile?.name) return;

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomName: chatId,
              participantName: profile.name,
            }),
          }
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })()
  }, [profile?.name, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!video) {
    // Audio-only room - don't request video permissions
    return (
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect
        video={false}
        audio={audio}
      >
        <AudioRoom onLeave={onLeave} />
      </LiveKitRoom>
    );
  }

  // Video room - use VideoConference
  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};