import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";

export const initialProfile = async () => {
    const user = await currentUser();
    if (!user) {
        redirect('/sign-in');
        return null;
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id,
        },
    });

    if (profile) {
        // Update imageUrl if missing
        if (!profile.imageUrl && user.imageUrl) {
            await db.profile.update({
                where: { id: profile.id },
                data: { imageUrl: user.imageUrl }
            });
            profile.imageUrl = user.imageUrl;
        }
        return profile;
    }

    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0]?.emailAddress,
            imageUrl: user.imageUrl,
        }
    });
    return newProfile;
};

