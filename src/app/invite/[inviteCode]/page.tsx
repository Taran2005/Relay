"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServerWithMembersAndProfile } from "@/types/types";
import { Member, Profile } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";

const InviteCodePage = ({ params }: { params: Promise<{ inviteCode: string }> }) => {
    const router = useRouter();

    const [server, setServer] = useState<ServerWithMembersAndProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [inviteCode, setInviteCode] = useState<string>("");
    const [isBanned, setIsBanned] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            const resolvedParams = await params;
            setInviteCode(resolvedParams.inviteCode);
        };
        initialize();
    }, [params]);

    useEffect(() => {
        if (!inviteCode) return;

        const fetchServer = async () => {
            try {
                const response = await axios.get(`/api/invite/${inviteCode}/info`);
                const serverData = response.data;
                setServer(serverData);

                const profileResponse = await axios.get('/api/currentProfile');
                const profile = profileResponse.data;

                if (profile) {
                    const isMember = serverData.members.some((member: Member & { profile: Profile }) => member.profileId === profile.id);
                    if (isMember) {
                        router.push(`/servers/${serverData.id}`);
                        return;
                    }

                    // Check if user is banned
                    try {
                        const banResponse = await axios.get(`/api/servers/${serverData.id}/bans/${profile.id}`);
                        if (banResponse.status === 200) {
                            setIsBanned(true);
                            return;
                        }
                    } catch (banError) {
                        // User is not banned, continue normally
                        logger.debug("Ban check error:", banError);
                    }
                }
            } catch (error) {
                logger.error("Failed to load invite page", error);
            } finally {
                setLoading(false);
            }
        };

        if (inviteCode) {
            fetchServer();
        }
    }, [inviteCode, router]);

    const onClick = async () => {
        if (!server) return;

        try {
            setLoading(true);
            const response = await axios.patch(`/api/servers/${server.id}/join`);

            if (response.data) {
                router.push(`/servers/${server.id}`);
            }
        } catch (error) {
            logger.error("Failed to join server", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isBanned) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-gray-500">You have been banned from this server.</p>
            </div>
        );
    }

    if (!server) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500">Invalid Invite</h1>
                <p className="text-gray-500">This invite link is invalid or has expired.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex items-center justify-center">
            <Dialog open={true}>
                <DialogContent className="bg-white text-black p-0 overflow-hidden">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl text-center font-bold">
                            Join {server.name}
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500">
                            You&apos;ve been invited to join {server.name}. Click the button below to accept the invitation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <div className="flex items-center justify-center mb-4">
                            {server.imageUrl && (
                                <Image
                                    src={server.imageUrl}
                                    alt={server.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full"
                                />
                            )}
                        </div>
                        <div className="flex items-center justify-center">
                            <Button
                                onClick={onClick}
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? "Joining..." : "Accept Invite"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InviteCodePage;