import { generateSocketToken } from '@/lib/socket-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const token = await generateSocketToken();

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        return NextResponse.json({ token });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}