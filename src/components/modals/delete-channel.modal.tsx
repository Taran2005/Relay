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

import { useDeleteChannel } from "@/lib/hooks/use-delete-channel";
import { useModalStore } from "@/lib/hooks/use-modal-store";

export const DeleteChannelModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "deleteChannel";
    const channel = data?.channel;
    const server = data?.server;

    const { deleteChannel, loading: isLoading, error: deleteError } = useDeleteChannel();

    const onConfirm = async () => {
        try {
            if (!channel || !server) return;

            await deleteChannel({
                channelId: channel.id,
                serverId: server.id,
            });

            onClose();
        } catch {
            // Error is handled by the hook
        }
    };

    if (!channel || !server) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { if (isModalOpen) onClose(); }}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-md">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Are you sure you want to delete <strong>#{channel.name}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {deleteError && <p className="text-red-500 text-sm text-center">{deleteError}</p>}

                <DialogFooter className="px-0 pb-0">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            onClick={onClose}
                            disabled={isLoading}
                            variant="ghost"
                            className="px-6 py-2 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            variant="destructive"
                            className="px-6 py-2 text-sm font-medium"
                        >
                            {isLoading ? "Deleting..." : "Delete Channel"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};