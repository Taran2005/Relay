const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = true;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('🚀 Starting development server with Socket.IO support...');

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`✅ Ready on http://${hostname}:${port}`);
        console.log(`📁 App directory: ${process.cwd()}`);
        console.log(`🔌 Socket.IO endpoint will be available at /api/socket/io`);
    });
});