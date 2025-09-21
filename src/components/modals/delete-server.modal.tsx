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

import { useModalStore } from "@/lib/hooks/use-modal-store";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const DeleteServerModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "deleteServer";
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onConfirm = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/servers/${data.server?.id}`);
            onClose();
            router.push("/");
            toast.success("Server deleted successfully!");
        } catch (error) {
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
                    </DialogDescription>
                </DialogHeader>

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
                            disabled={isLoading}
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