"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CallTarget } from "@/lib/hooks/use-call-store";

interface CallSessionData {
    token: string;
    url: string;
    roomName: string;
    identity: string;
    participantName: string;
    startVideo: boolean;
    friendlyName?: string | null;
}

interface UseCallSessionOptions {
    active: boolean;
    target?: CallTarget;
}

interface UseCallSessionResult {
    status: "idle" | "loading" | "ready" | "error";
    data?: CallSessionData;
    error?: string;
    refresh: () => void;
}

export const useCallSession = ({ active, target }: UseCallSessionOptions): UseCallSessionResult => {
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(active ? "loading" : "idle");
    const [data, setData] = useState<CallSessionData | undefined>();
    const [error, setError] = useState<string | undefined>();

    const payload = useMemo(() => {
        if (!target) return undefined;
        return {
            targetType: target.type,
            targetId: target.targetId,
            serverId: target.serverId,
            startVideo: target.startVideo,
        };
    }, [target]);

    const fetchToken = useCallback(async () => {
        if (!active || !payload) {
            setStatus(active ? "loading" : "idle");
            setData(undefined);
            setError(undefined);
            return;
        }

        setStatus("loading");
        setError(undefined);

        try {
            const response = await fetch("/api/calls/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const body = await response.json();

            if (!response.ok) {
                throw new Error(body?.error || "Unable to start call");
            }

            setData(body as CallSessionData);
            setStatus("ready");
        } catch (err) {
            console.error("Failed to fetch LiveKit token", err);
            setError(err instanceof Error ? err.message : "Unexpected error");
            setStatus("error");
        }
    }, [active, payload]);

    useEffect(() => {
        if (active && payload) {
            void fetchToken();
        } else if (!active) {
            setStatus("idle");
            setData(undefined);
            setError(undefined);
        }
    }, [active, payload, fetchToken]);

    return {
        status,
        data,
        error,
        refresh: fetchToken,
    };
};
