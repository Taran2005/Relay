import { ServerSidebar } from "@/components/server/server.sidebar";
import { currentProfile } from "@/lib/current.profile";
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


    return (
        <div className="h-full">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId} />
            </div>
            <main className="h-full md:pl-60">{children}</main>
        </div>
    );
}
