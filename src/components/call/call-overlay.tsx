"use client";

import { Loader2, RefreshCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useCallSession } from "@/hooks/use-call-session";
import { useCallStore } from "@/lib/hooks/use-call-store";
import { CallRoom } from "./call-room";

export const CallOverlay = () => {
    const { isOpen, target, close } = useCallStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { status, data, error, refresh } = useCallSession({
        active: isOpen,
        target,
    });

    if (!mounted) return null;
    if (!isOpen || !target) return null;

    const title = target.title || (target.type === "conversation" ? "Direct Call" : "Channel Call");

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm">
            <header className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                    <p className="text-sm text-white/70 uppercase tracking-wide">LiveKit Call</p>
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    {data?.friendlyName && (
                        <p className="text-xs text-white/60">Connected with {data.friendlyName}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {status === "error" && (
                        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
                            <RefreshCcw className="h-4 w-4" /> Retry
                        </Button>
                    )}
                    <Button variant="destructive" onClick={close} className="gap-2">
                        <X className="h-4 w-4" /> Leave
                    </Button>
                </div>
            </header>
            <main className="flex-1 min-h-0">
                {status === "loading" && (
                    <div className="h-full flex flex-col items-center justify-center text-white/70 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Connecting to LiveKit…</p>
                    </div>
                )}
                {status === "error" && (
                    <div className="h-full flex flex-col items-center justify-center text-white/70 gap-3">
                        <p className="text-sm">{error ?? "We couldn't start the call."}</p>
                        <div className="flex gap-3">
                            <Button onClick={refresh} className="gap-2">
                                <RefreshCcw className="h-4 w-4" /> Try again
                            </Button>
                            <Button variant="secondary" onClick={close}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
                {status === "ready" && data && (
                    <div className="h-full">
                        <CallRoom
                            token={data.token}
                            serverUrl={data.url}
                            startVideo={target.startVideo ?? data.startVideo}
                            onDisconnected={close}
                        />
                    </div>
                )}
            </main>
        </div>,
        document.body
    );
};
