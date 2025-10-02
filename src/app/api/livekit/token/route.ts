import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName } = await request.json();

    console.log('Request received:', { roomName, participantName });
    console.log('Environment check:', {
      apiKey: process.env.LIVEKIT_API_KEY ? 'present' : 'missing',
      apiSecret: process.env.LIVEKIT_API_SECRET ? 'present (' + process.env.LIVEKIT_API_SECRET!.length + ' chars)' : 'missing',
      url: process.env.LIVEKIT_URL
    });

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 });
    }

    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      console.error('Missing LiveKit credentials');
      return NextResponse.json({ error: 'LiveKit credentials not configured' }, { status: 500 });
    }

    console.log('Creating AccessToken with key:', process.env.LIVEKIT_API_KEY.substring(0, 10) + '...');

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    console.log('Token generated successfully, length:', token.length);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}