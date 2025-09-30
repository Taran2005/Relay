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

import { Skeleton } from "@/components/ui/skeleton";
import { useServer } from "@/hooks/use-server";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { Ban, Member, MemberRole, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Crown, Loader2, MoreVertical, Shield, ShieldCheck, UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ManageMembersModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "manageMembers";
    const [loadingId, setLoadingId] = useState<string>("");
    const [showBanned, setShowBanned] = useState(false);
    const queryClient = useQueryClient();

    const serverId = data?.server?.id;
    const { data: server, error, isLoading } = useServer(serverId, true);

    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {
            setLoadingId(memberId);
            await axios.patch(`/api/members/${memberId}`, { role });

            queryClient.invalidateQueries({ queryKey: ["server", serverId, true] });

            toast.success("Role updated successfully");
        } catch {
            toast.error("Failed to update role");
        } finally {
            setLoadingId("");
        }
    };

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            await axios.delete(`/api/members/${memberId}`);

            queryClient.invalidateQueries({ queryKey: ["server", serverId, true] });

            toast.success("Member kicked successfully");
        } catch {
            toast.error("Failed to kick member");
        } finally {
            setLoadingId("");
        }
    };

    const onBan = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            // First ban the user
            await axios.post(`/api/members/${memberId}/ban`);
            // Then remove them from members
            await axios.delete(`/api/members/${memberId}`);

            queryClient.invalidateQueries({ queryKey: ["server", serverId, true] });

            toast.success("Member banned successfully");
        } catch {
            toast.error("Failed to ban member");
        } finally {
            setLoadingId("");
        }
    };

    const onUnban = async (banId: string) => {
        try {
            setLoadingId(banId);
            await axios.delete(`/api/bans/${banId}`);

            queryClient.invalidateQueries({ queryKey: ["server", serverId, true] });

            toast.success("Member unbanned successfully");
        } catch {
            toast.error("Failed to unban member");
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
                    <div className="flex justify-center mt-4">
                        <Button
                            variant={showBanned ? "outline" : "default"}
                            onClick={() => setShowBanned(false)}
                            className="mr-2"
                        >
                            Members
                        </Button>
                        <Button
                            variant={showBanned ? "default" : "outline"}
                            onClick={() => setShowBanned(true)}
                        >
                            Banned
                        </Button>
                    </div>
                </DialogHeader>

                <div className="mt-6 max-h-[420px] overflow-y-auto">
                    {isLoading ? (
                        <div className="space-y-4">
                            {/* Skeleton for member items */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-x-2 mb-4">
                                    <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                                    <div className="flex flex-col gap-y-1 flex-1">
                                        <Skeleton className="h-4 w-32 bg-muted" />
                                        <Skeleton className="h-3 w-16 bg-muted" />
                                    </div>
                                    <Skeleton className="h-8 w-8 bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : showBanned ? (
                        server?.bans?.map((ban: Ban & { profile: Profile }) => (
                            <div key={ban.id} className="flex items-center gap-x-2 mb-4">
                                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                                    {ban.profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-sm font-semibold">
                                        {ban.profile.name}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Banned
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onUnban(ban.id)}
                                        disabled={loadingId === ban.id}
                                    >
                                        {loadingId === ban.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Unban"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        server?.members?.map((member: Member & { profile: Profile }) => (
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
                                                <DropdownMenuItem
                                                    onClick={() => onBan(member.id)}
                                                    disabled={loadingId === member.id}
                                                    className="text-destructive"
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Ban
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