<div align="center">

# Relay

A modern Discord-inspired chat platform built with Next.js, Prisma, Clerk, Socket.IO, and LiveKit for real-time messaging plus voice & video rooms.

</div>

## ✨ Features

- Server & channel management with text, voice, and video channel types
- Direct conversations with typing in real time and message history
- LiveKit-powered audio/video rooms for channels and 1:1 calls
- Clerk authentication and role-based server permissions
- Prisma + PostgreSQL data layer

## 🚀 Getting started

```bash
npm install
npm run dev
```

The app boots on [http://localhost:3000](http://localhost:3000). Make sure your database and Clerk credentials are configured before starting the server.

## 🔐 Environment variables

Create a `.env.local` file in the project root (next to `package.json`) and provide the secrets below. Existing installs will already use variables for Clerk and the database—add these LiveKit entries alongside them:

```bash
LIVEKIT_URL=     # e.g. wss://example-cluster.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

If you expose your app on a custom domain, optionally set `NEXT_PUBLIC_SITE_URL` for the Socket.IO client and `ALLOWED_ORIGINS` for the Socket server. Remember to keep `JWT_SECRET` configured for socket authentication in production.

## 🎥 LiveKit configuration

1. Spin up a LiveKit Cloud instance (or self-hosted deployment).
2. Generate an API key & secret from the LiveKit dashboard.
3. Copy the host URL (WebSocket address) and paste all three values into `.env.local` as shown above.
4. Restart the dev server so the new environment variables load.

With the credentials in place:

- Joining an **audio** or **video** channel automatically opens a LiveKit room in the channel view.
- In direct conversations, the phone and camera icons start LiveKit-powered voice or video calls in an overlay that both participants can join.

## 🧪 Useful scripts

```bash
npm run dev      # Start the Next.js + Socket.IO dev server
npm run lint     # Lint the project
npm run build    # Production build (uses Turbopack)
```

## 📚 Additional references

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [LiveKit Docs](https://docs.livekit.io/)
