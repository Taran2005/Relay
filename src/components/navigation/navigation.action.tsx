// components/navigation/NavigationAction.tsx

"use client";

import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ActionTooltip } from "@/components/action.tooltip";
import { FileUpload } from "@/components/fileupload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/30 to-muted/20 hover:from-blue-500/70 hover:to-purple-600/70 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 border-2 border-muted-foreground/20 hover:border-blue-400/50 hover:ring-1 hover:ring-blue-400/30"
                >
                    <Plus className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 drop-shadow-sm" />
                </button>
            </ActionTooltip>

            {/* Modal dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-gradient-to-br from-background to-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            Create a Server
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Give your server a name and optional image.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-6 p-2">
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
                            className="bg-background/50 border-border/50 focus:border-blue-400/60 focus:ring-blue-400/30 transition-colors"
                        />
                        <Button
                            type="submit"
                            disabled={disabled}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                        >
                            {uploading ? "Uploading..." : loading ? "Creating..." : "Create"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
