import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";

// Extend the global namespace for Socket.IO
declare global {
    var httpServer: NetServer | undefined;
    var io: ServerIO | undefined;
}

export async function GET() {
    const res = new Response("Socket.IO endpoint active", {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });

    // Initialize Socket.IO if not already done
    const httpServer = globalThis.httpServer;
    if (httpServer && !globalThis.io) {
        console.log("🔌 Initializing Socket.IO server...");

        const io = new ServerIO(httpServer, {
            path: "/api/socket/io",
            addTrailingSlash: false,
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
            transports: ['polling', 'websocket'],
        });

        globalThis.io = io;

        io.on('connection', (socket) => {
            console.log("🟢 Client connected:", socket.id);

            socket.on('disconnect', (reason) => {
                console.log("🔴 Client disconnected:", socket.id, "Reason:", reason);
            });

            socket.on('join-channel', (channelId: string) => {
                socket.join(channelId);
                console.log(`📢 User ${socket.id} joined channel: ${channelId}`);
            });

            socket.on('leave-channel', (channelId: string) => {
                socket.leave(channelId);
                console.log(`👋 User ${socket.id} left channel: ${channelId}`);
            });
        });

        console.log("✅ Socket.IO server initialized");
    }

    return res;
}

export async function POST() {
    return GET();
}