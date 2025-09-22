"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { ServerWithMembersAndProfile } from "@/types/types";
import { MemberRole } from "@prisma/client";
import { ChevronDown, LogOut, Plus, Settings, Trash, UserPlus, Users } from "lucide-react";

interface ServerHeaderProps {
    server: ServerWithMembersAndProfile;
    role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
    const { onOpen } = useModalStore();
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-foreground truncate">
                    {server.name}
                </h1>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border border-border/50">
                    {isModerator && (
                        <DropdownMenuItem onClick={() => onOpen("invite", { server })}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite People
                        </DropdownMenuItem>
                    )}
                    {isModerator && (
                        <DropdownMenuItem onClick={() => onOpen("createChannel", { server })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Channel
                        </DropdownMenuItem>
                    )}
                    {isAdmin && (
                        <DropdownMenuItem onClick={() => onOpen("serverSettings", { server })}>
                            <Settings className="mr-2 h-4 w-4" />
                            Server Settings
                        </DropdownMenuItem>
                    )}
                    {isAdmin && (
                        <DropdownMenuItem onClick={() => onOpen("manageMembers", { server })}>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                        </DropdownMenuItem>
                    )}
                    {isAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onOpen("deleteServer", { server })}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Server
                            </DropdownMenuItem>
                        </>
                    )}
                    {!isAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onOpen("leaveServer", { server })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Server
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}