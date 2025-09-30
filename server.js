const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ['websocket', 'polling'],
    });

    // Set the io instance
    global.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        
        // Handle joining channels/rooms
        socket.on('join-channel', (channelId) => {
            console.log(`Socket ${socket.id} joining channel: ${channelId}`);
            socket.join(channelId);
        });
        
        // Handle leaving channels/rooms
        socket.on('leave-channel', (channelId) => {
            console.log(`Socket ${socket.id} leaving channel: ${channelId}`);
            socket.leave(channelId);
        });
        
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});