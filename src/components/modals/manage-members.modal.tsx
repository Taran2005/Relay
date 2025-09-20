"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { useModalStore } from "@/lib/hooks/use-modal-store";
import { ServerWithMembersAndProfile } from "@/types/types";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import { Crown, Loader2, MoreVertical, Shield, ShieldCheck, UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const ManageMembersModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "manageMembers";
    const [loadingId, setLoadingId] = useState<string>("");

    const serverId = data?.server?.id;
    const { data: server, error, isLoading, mutate } = useSWR<ServerWithMembersAndProfile>(
        serverId ? `/api/servers/${serverId}` : null,
        fetcher
    );

    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {
            setLoadingId(memberId);
            await axios.patch(`/api/members/${memberId}`, { role });

            // Optimistically update the cache
            mutate((currentServer) => {
                if (!currentServer) return currentServer;
                return {
                    ...currentServer,
                    members: currentServer.members.map((member) =>
                        member.id === memberId ? { ...member, role } : member
                    ),
                };
            }, false);

            toast.success("Role updated successfully");
        } catch {
            toast.error("Failed to update role");
            // Revert on error
            mutate();
        } finally {
            setLoadingId("");
        }
    };

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            await axios.delete(`/api/members/${memberId}`);

            // Optimistically update the cache
            mutate((currentServer) => {
                if (!currentServer) return currentServer;
                return {
                    ...currentServer,
                    members: currentServer.members.filter((member) => member.id !== memberId),
                };
            }, false);

            toast.success("Member kicked successfully");
        } catch {
            toast.error("Failed to kick member");
            // Revert on error
            mutate();
        } finally {
            setLoadingId("");
        }
    };

    const roleIconMap = {
        [MemberRole.GUEST]: null,
        [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
        [MemberRole.ADMIN]: <Crown className="h-4 w-4 ml-2 text-yellow-500" />
    };

    if (error) {
        return (
            <Dialog open={isModalOpen} onOpenChange={onClose}>
                <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-2xl">
                    <DialogHeader className="pt-0 px-0">
                        <DialogTitle className="text-2xl font-bold text-center">
                            Error
                        </DialogTitle>
                        <DialogDescription className="text-center text-red-400">
                            Failed to load server data
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-2xl">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Manage server members and their roles
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 max-h-[420px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading members...</span>
                        </div>
                    ) : (
                        server?.members?.map((member) => (
                            <div key={member.id} className="flex items-center gap-x-2 mb-4">
                                <div className="h-10 w-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                                    {member.profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-semibold flex items-center gap-x-1">
                                        {member.profile.name}
                                        {roleIconMap[member.role]}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {member.role}
                                    </p>
                                </div>
                                {server.creatorId !== member.profileId && (
                                    <div className="ml-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    disabled={loadingId === member.id}
                                                >
                                                    {loadingId === member.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreVertical className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="left">
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onRoleChange(member.id, MemberRole.GUEST)}
                                                    disabled={loadingId === member.id}
                                                >
                                                    <Shield className="h-4 w-4 mr-2" />
                                                    Guest
                                                    {member.role === MemberRole.GUEST && (
                                                        <span className="ml-auto text-green-500">✓</span>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onRoleChange(member.id, MemberRole.MODERATOR)}
                                                    disabled={loadingId === member.id}
                                                >
                                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                                    Moderator
                                                    {member.role === MemberRole.MODERATOR && (
                                                        <span className="ml-auto text-green-500">✓</span>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onKick(member.id)}
                                                    disabled={loadingId === member.id}
                                                    className="text-destructive"
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Kick
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};