const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const JWT_SECRET = (() => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    if (!dev) {
        throw new Error('JWT_SECRET must be set in production environments');
    }

    throw new Error('JWT_SECRET must be set in environment variables');
})();

const prisma = new PrismaClient();

function verifySocketToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    if (signature !== expectedSignature) {
        return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }

    return payload;
}

async function validateSocketAccess(profileId, meta = {}) {
    if (!profileId) {
        return false;
    }

    try {
        if (meta.channelId && meta.serverId) {
            const channel = await prisma.channel.findFirst({
                where: {
                    id: meta.channelId,
                    serverId: meta.serverId,
                    server: {
                        members: {
                            some: { profileId },
                        },
                    },
                },
            });

            if (channel) {
                return true;
            }
        }

        if (meta.conversationId) {
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: meta.conversationId,
                    OR: [
                        { memberOne: { profileId } },
                        { memberTwo: { profileId } },
                    ],
                },
            });

            if (conversation) {
                return true;
            }
        }
    } catch (error) {
        console.error('[SOCKET] Failed to validate access', error);
        return false;
    }

    return false;
}

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Parse allowed origins from environment
    const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        defaultOrigins.push(process.env.NEXT_PUBLIC_SITE_URL);
    }
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : defaultOrigins;

    const io = new Server(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // Set the io instance
    global.io = io;

    io.use((socket, next) => {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        const payload = verifySocketToken(token);

        if (!payload) {
            return next(new Error('Unauthorized'));
        }

        socket.data.profileId = payload.profileId;
        return next();
    });

    io.on('connection', (socket) => {
        // Handle joining channels/rooms
        socket.on('join-channel', async (payload) => {
            const room = typeof payload === 'string' ? payload : payload?.room;
            const meta = typeof payload === 'object' && payload ? payload.meta : undefined;

            if (typeof room !== 'string' || !room.startsWith('chat:') || !room.includes(':messages')) {
                return;
            }

            const hasAccess = await validateSocketAccess(socket.data.profileId, meta);

            if (hasAccess) {
                socket.join(room);
            }
        });

        // Handle leaving channels/rooms
        socket.on('leave-channel', (channelId) => {
            const room = typeof channelId === 'string' ? channelId : channelId?.room;
            if (typeof room === 'string') {
                socket.leave(room);
            }
        });

        socket.on('disconnect', () => {
            // Handle disconnect
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
    });
});

const handleShutdown = async () => {
    try {
        await prisma.$disconnect();
    } finally {
        process.exit(0);
    }
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);