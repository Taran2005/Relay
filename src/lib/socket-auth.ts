import crypto from 'crypto';
import { currentProfile } from './current.profile';

const FALLBACK_SECRET = 'your-fallback-jwt-secret-change-this';
const JWT_SECRET = (() => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production environments');
    }

    return FALLBACK_SECRET;
})();

export interface SocketAuthPayload {
    userId: string;
    profileId: string;
    iat: number;
    exp: number;
}

function base64UrlEncode(str: string): string {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
    str += '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

export async function generateSocketToken(): Promise<string | null> {
    try {
        const profile = await currentProfile();
        if (!profile) return null;

        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const payload = {
            userId: profile.userId,
            profileId: profile.id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };

        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));

        const signature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('Error generating socket token:', error);
        return null;
    }
}

export async function verifySocketToken(token: string): Promise<SocketAuthPayload | null> {
    try {
        if (!token || token === 'undefined' || token === 'null') {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [encodedHeader, encodedPayload, signature] = parts;

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        if (signature !== expectedSignature) {
            return null;
        }

        const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SocketAuthPayload;

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Error verifying socket token:', error);
        return null;
    }
}

export async function validateSocketAccess(
    profileId: string,
    channelId: string
): Promise<boolean> {
    try {
        const { db } = await import('./db');

        if (channelId.includes('conversation')) {
            // For direct messages - check if user is part of conversation
            const conversationId = channelId.split(':')[1];
            const conversation = await db.conversation.findFirst({
                where: {
                    id: conversationId,
                    OR: [
                        { memberOne: { profileId } },
                        { memberTwo: { profileId } }
                    ]
                }
            });
            return !!conversation;
        } else {
            // For server channels - check if user is member of server
            const actualChannelId = channelId.split(':')[1];
            const channel = await db.channel.findFirst({
                where: {
                    id: actualChannelId,
                    server: {
                        members: {
                            some: { profileId }
                        }
                    }
                }
            });
            return !!channel;
        }
    } catch (error) {
        console.error('Error validating socket access:', error);
        return false;
    }
}