import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";


export const currentProfile = async () => {
    try {
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
    } catch (error) {
        console.error('Error getting current profile:', error);
        return null;
    }
};
