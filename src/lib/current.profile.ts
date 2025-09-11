import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";


export const currentProfile = async () => {
    const user = await auth();

    if (!user?.userId) {
        return null;
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: user.userId,
        },
    });

    return profile;
};
