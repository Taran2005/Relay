"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { logger } from "@/lib/logger";
import axios from "axios";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export const InviteModal = () => {
    const { isOpen, type, onClose, data, onOpen } = useModalStore();

    const isModalOpen = isOpen && type === "invite";
    const { server } = data;

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    useEffect(() => {
        if (isModalOpen && server && !server.inviteCode) {
            const generateInviteCode = async () => {
                try {
                    setIsLoading(true);
                    const response = await axios.patch(`/api/servers/${server.id}/invite`);
                    onOpen("invite", { server: response.data });
                } catch (error) {
                    logger.error("Failed to generate new invite", error);
                } finally {
                    setIsLoading(false);
                }
            };
            generateInviteCode();
        }
    }, [isModalOpen, server, onOpen]);

    const inviteUrl = origin ? `${origin}/invite/${server?.inviteCode}` : "";

    const onCopy = () => {
        if (inviteUrl) {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1000);
        }
    };

    const onNew = async () => {
        try {
            setIsLoading(true);
            const response = await axios.patch(`/api/servers/${server?.id}/invite`);

            onOpen("invite", { server: response.data });
        } catch (error) {
            logger.error("Failed to generate invite link", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Invite Friends
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Share this link with your friends to invite them to your server.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6">
                    <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server invite link
                    </Label>
                    <div className="flex items-center mt-2 gap-x-2">
                        <Input
                            disabled={isLoading || !inviteUrl}
                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                            value={inviteUrl || "Generating invite link..."}
                            readOnly
                        />
                        <Button
                            disabled={isLoading || !inviteUrl}
                            onClick={onCopy}
                            size="icon"
                        >
                            {copied ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <Button
                        onClick={onNew}
                        disabled={isLoading}
                        variant="link"
                        size="sm"
                        className="text-xs text-zinc-500 mt-4"
                    >
                        Generate a new link
                        <RefreshCw className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
