"use client";

import { useSocket } from "@/components/providers/socket.provider";
import { useEffect, useState } from "react";

export const PollingDebugger = () => {
    const { socket, isConnected } = useSocket();
    const [lastPoll, setLastPoll] = useState<Date | null>(null);
    const [socketEvents, setSocketEvents] = useState<string[]>([]);

    useEffect(() => {
        if (!socket) return;

        const addEvent = (event: string) => {
            setSocketEvents(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${event}`]);
        };

        socket.on('connect', () => addEvent('Connected'));
        socket.on('disconnect', () => addEvent('Disconnected'));
        socket.onAny((eventName, data) => {
            if (eventName.includes('chat:')) {
                addEvent(`📨 ${eventName.split(':')[2] || 'message'}: ${data?.id?.slice(-4) || 'unknown'}`);
            }
        });

        return () => {
            socket.offAny();
        };
    }, [socket]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isConnected) {
                setLastPoll(new Date());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isConnected]);

    return (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
            <h3 className="font-bold mb-2">Polling Debug</h3>
            <div className="space-y-1">
                <div>Status: {isConnected ? '🟢 Socket Connected' : '🔴 Socket Disconnected'}</div>
                <div>Socket ID: {socket?.id || 'None'}</div>
                {!isConnected && lastPoll && (
                    <div>Last Poll: {lastPoll.toLocaleTimeString()}</div>
                )}
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs mt-2"
                >
                    🔄 Force Refresh
                </button>
                <div className="mt-2">
                    <div className="font-semibold">Recent Events:</div>
                    {socketEvents.map((event, i) => (
                        <div key={i} className="text-xs opacity-80">{event}</div>
                    ))}
                    {socketEvents.length === 0 && (
                        <div className="text-xs opacity-60">No events yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};