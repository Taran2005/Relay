"use client";

import { useSocket } from "@/components/providers/socket.provider";

export const SocketStatus = () => {
    const { isConnected } = useSocket();

    return (
        <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-md text-xs font-medium shadow-lg ${isConnected
            ? "bg-green-500/90 text-white"
            : "bg-red-500/90 text-white"
            }`}>
            {isConnected ? "🟢 Real-time Connected" : "🔴 Real-time Disconnected"}
        </div>
    );
};