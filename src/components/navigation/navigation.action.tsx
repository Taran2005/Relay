// components/navigation/NavigationAction.tsx

"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/fileupload";
import { ActionTooltip } from "@/components/action.tooltip";

export const NavigationAction = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const disabled = loading || uploading || name.trim().length < 3;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled) return;

        try {
            setLoading(true);
            await axios.post("/api/servers", {
                name: name.trim(),
                imageUrl,
            });

            setName("");
            setImageUrl(null);
            setOpen(false);

            // Refresh sidebar servers list
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <>
            {/* Plus button in the sidebar */}
            <ActionTooltip
                side="right"
                align="center"
                label="Add a Server"
            >
                <button
                    onClick={() => setOpen(true)}
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 hover:bg-emerald-500 hover:text-white transition"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </ActionTooltip>

            {/* Modal dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-background border-0 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Create a Server</DialogTitle>
                        <DialogDescription>
                            Give your server a name and optional image.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-4 p-4">
                        <div className="flex justify-center">
                            <FileUpload
                                value={imageUrl || ""}
                                onChange={setImageUrl}
                                endpoint="serverImage"
                                onUploading={setUploading}
                            />
                        </div>
                        <Input
                            placeholder="Server name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading || uploading}
                        />
                        <Button type="submit" disabled={disabled} className="w-full">
                            {uploading ? "Uploading..." : loading ? "Creating..." : "Create"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
