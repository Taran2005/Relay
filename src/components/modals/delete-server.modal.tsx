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
import { Input } from "@/components/ui/input";

import { useModalStore } from "@/lib/hooks/use-modal-store";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

interface Server {
    id: string;
    name: string;
    imageUrl: string | null;
}

export const DeleteServerModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "deleteServer";
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const { data: profile } = useSWR(user ? '/api/currentProfile' : null, async (url) => {
        const res = await axios.get(url);
        return res.data;
    });

    const onConfirm = async () => {
        if (!profile?.id) return;

        // Optimistically remove server from cache
        mutate(`/api/servers?memberId=${profile.id}`, (currentServers: Server[] | undefined) =>
            currentServers?.filter(s => s.id !== data.server?.id), false
        );

        try {
            setIsLoading(true);
            await axios.delete(`/api/servers/${data.server?.id}`);
            onClose();
            router.push("/");
            toast.success("Server deleted successfully!");
        } catch (error) {
            // Revert optimistic update on error
            mutate(`/api/servers?memberId=${profile.id}`);
            console.error(error);
            toast.error("Failed to delete server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { if (isModalOpen) onClose(); }}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-md">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center text-destructive">
                        Delete Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Are you sure you want to delete <strong>{data.server?.name}</strong>? This action cannot be undone.
                        <br />
                        <br />
                        This will permanently delete the server, all channels, messages, and remove all members.
                        <br />
                        <br />
                        To confirm, type <strong>{data.server?.name}</strong> below:
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={`Type "${data.server?.name}" to confirm`}
                        className="text-center"
                    />
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
                            disabled={isLoading || confirmText !== data.server?.name}
                            onClick={onConfirm}
                            variant="destructive"
                            className="h-10"
                        >
                            {isLoading ? "Deleting..." : "Delete Server"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};