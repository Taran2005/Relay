import { Channel, Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersAndProfile = Server & {
    members: (Member & {
        profile: Profile;
    })[];
    channels: Channel[];
};