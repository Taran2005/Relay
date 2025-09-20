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
import { MoreVertical, Shield, ShieldCheck, UserMinus, Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export const ManageMembersModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "manageMembers";
    const [loadingId, setLoadingId] = useState<string>("");

    const server = data.server as ServerWithMembersAndProfile;

    const onRoleChange = async (memberId: string, role: MemberRole) => {
        try {
            setLoadingId(memberId);
            await axios.patch(`/api/members/${memberId}`, { role });
            toast.success("Role updated successfully");
            // Refresh the page to show updated data
            window.location.reload();
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
            toast.success("Member kicked successfully");
            onClose();
        } catch {
            toast.error("Failed to kick member");
        } finally {
            setLoadingId("");
        }
    };

    const roleIconMap = {
        [MemberRole.GUEST]: null,
        [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
        [MemberRole.ADMIN]: <Crown className="h-4 w-4 ml-2 text-yellow-500" />
    };

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
                    {server?.members?.map((member) => (
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
                                                <MoreVertical className="h-4 w-4" />
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
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};