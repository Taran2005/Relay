import { ChatHeader } from "@/components/chat/chat-header";
import { currentProfile } from "@/lib/current.profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params: Promise<{
        serverId: string;
        memberId: string;
    }>;
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
    const { serverId, memberId } = await params;

    const profile = await currentProfile();
    if (!profile) {
        return redirect("/");
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        },
    });

    if (!currentMember) {
        return redirect("/");
    }

    const conversation = await db.member.findUnique({
        where: {
            id: memberId,
        },
        include: {
            profile: true,
        },
    });

    if (!conversation) {
        return redirect("/");
    }

    return (
        <div className="flex flex-col h-full">
            <ChatHeader
                serverId={serverId}
                name={conversation.profile.name}
                type="conversation"
                imageUrl={conversation.profile.imageUrl || undefined}
            />
            <div className="flex-1 p-4">
                {/* Chat messages will go here */}
                <div className="text-center text-muted-foreground">
                    This is the start of your conversation with {conversation.profile.name}
                </div>
            </div>
        </div>
    );
};

export default MemberIdPage;