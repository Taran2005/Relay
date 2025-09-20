import { Ban, Channel, Member, Profile, Server } from "@prisma/client";

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