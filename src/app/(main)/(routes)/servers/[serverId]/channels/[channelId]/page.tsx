import { ChatHeader } from "@/components/chat/chat-header";
import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
    params: Promise<{
        serverId: string;
        channelId: string;
    }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
    const { serverId, channelId } = await params;

    const profile = await currentProfile();
    if (!profile) {
        return redirect("/");
    }

    const channel = await db.channel.findUnique({
        where: {
            id: channelId,
        },
    });

    const member = await db.member.findFirst({
        where: {
            serverId,
            profileId: profile.id,
        },
    });

    if (!channel || !member) {
        return redirect("/");
    }

    return (
        <div className="flex flex-col h-full">
            <ChatHeader
                serverId={serverId}
                name={channel.name}
                type="channel"
                channelType={channel.type}
            />
            <div className="flex-1 p-4">
                <div className="text-center text-muted-foreground">
                    Welcome to #{channel.name}
                </div>
            </div>
        </div>
    );
};

export default ChannelIdPage;
