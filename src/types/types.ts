import { Ban, Channel, Member, Message, Profile, Server } from "@prisma/client";
import { Server as NetServer } from "http";
import { Socket } from "net";
import { NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export type ServerWithMembersAndProfile = Server & {
    members: (Member & {
        profile: Profile;
    })[];
    channels: Channel[];
};

export type ServerWithMembersAndProfileAndBans = Server & {
    members: (Member & {
        profile: Profile;
    })[];
    channels: Channel[];
    bans: (Ban & {
        profile: Profile;
    })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: ServerIO;
        };
    };
};

export type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    }
};

export type ChatMessage = MessageWithMemberWithProfile & {
    conversationId?: string | null;
    channelId?: string | null;
    fileUrl?: string | null;
    deleted?: boolean;
};