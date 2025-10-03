export async function GET() {
    // Parse allowed origins from environment
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    return new Response("Socket.IO endpoint active - using server.js instance", {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigins[0], // Use first allowed origin
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        }
    });
}

export async function POST() {
    return GET();
}