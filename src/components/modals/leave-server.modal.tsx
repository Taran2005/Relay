"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useLeaveServer } from "@/lib/hooks/use-leave-server";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export const LeaveServerModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "leaveServer";
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const { data: profile } = useSWR(user ? '/api/currentProfile' : null, async (url) => {
        const res = await axios.get(url);
        return res.data;
    });

    const { leaveServer } = useLeaveServer(data.server?.id || "", profile?.id);

    const onConfirm = async () => {
        try {
            setIsLoading(true);
            await leaveServer();
            onClose();
            router.push("/");
        } catch {
            // Error handling is done in the hook
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { if (isModalOpen) onClose(); }}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-md">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center text-destructive">
                        Leave Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Are you sure you want to leave <strong>{data.server?.name}</strong>?
                        <br />
                        <br />
                        You will no longer have access to this server and its channels.
                        <br />
                        <br />
                        Please confirm by checking the box below:
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="confirm-leave"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="confirm-leave" className="text-sm text-gray-400">
                        I understand I will lose access to this server.
                    </label>
                </div>

                <DialogFooter className="px-0 pb-0">
                    <div className="flex items-center justify-end w-full space-x-2">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
                            variant="outline"
                            className="h-10"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading || !isConfirmed}
                            onClick={onConfirm}
                            variant="destructive"
                            className="h-10"
                        >
                            {isLoading ? "Leaving..." : "Leave Server"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};