import { ServerSidebar } from "@/components/server/server.sidebar";
import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ServerIDLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ serverId: string }>;
}) {
    const { serverId } = await params;

    const profile = await currentProfile();
    if (!profile) {
        redirect("/sign-in");
    }

    // Check if user is a member of the server
    const member = await db.member.findFirst({
        where: {
            serverId,
            profileId: profile.id,
        },
    });

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
    });

    // If server doesn't exist or user is not a member and not the creator
    if (!server || (!member && server.creatorId !== profile.id)) {
        redirect("/");
    }

    return (
        <div className="h-full">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId} />
            </div>
            <main className="h-full md:pl-60">{children}</main>
        </div>
    );
}
