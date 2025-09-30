"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FileUpload } from "@/components/fileupload";

import { useCurrentProfile } from "@/lib/hooks/use-current-profile";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { useCreateServer } from "@/lib/hooks/use-servers";
import type { Server } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// 🔹 Validation Schema
const formSchema = z.object({
    serverName: z
        .string()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(30, { message: "Name must be at most 30 characters long" }),
    serverImage: z.string().optional(),
});

export const CreateServerModal = () => {
    const router = useRouter();
    const { isOpen, type, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "createServer";
    const [isUploading, setIsUploading] = useState(false);

    const { data: profile, isLoading: profileLoading } = useCurrentProfile();
    const createServerMutation = useCreateServer();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serverName: "",
            serverImage: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!profile) {
            toast.error("Authentication required. Please sign in.");
            return;
        }

        createServerMutation.mutate({
            name: data.serverName,
            imageUrl: data.serverImage || null
        }, {
            onSuccess: (newServer) => {
                form.reset();
                onClose();
                toast.success("Server created successfully!");

                // Type-safe channel access
                interface ServerWithChannels extends Server {
                    channels?: { id: string; name: string }[];
                }
                const serverWithChannels = newServer as ServerWithChannels;
                const generalChannel = serverWithChannels.channels?.find(
                    (channel) => channel.name === "general"
                );
                
                if (generalChannel) {
                    router.push(`/servers/${newServer.id}/channels/${generalChannel.id}`);
                } else {
                    router.push(`/servers/${newServer.id}`);
                }
            },
            onError: (error) => {
                console.error("Server creation failed:", error);
                toast.error("Failed to create server. Please try again.");
            }
        });
    };

    useEffect(() => {
        if (!isModalOpen) {
            form.reset();
        }
    }, [isModalOpen, form]);

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { if (isModalOpen) onClose(); }}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-md">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Customize your server
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Give your server a personality with a name and image. You can always
                        change it later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Server Image Upload */}
                        <div className="flex items-center justify-center text-center">
                            <FormField
                                control={form.control}
                                name="serverImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                onChange={field.onChange}
                                                value={field.value || ""}
                                                endpoint="serverImage"
                                                onUploading={setIsUploading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Server Name Field */}
                        <FormField
                            control={form.control}
                            name="serverName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Server Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={createServerMutation.isPending}
                                            placeholder="Enter server name"
                                            className="h-10 border-zinc-100"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {createServerMutation.error && (
                            <p className="text-red-500 text-sm">
                                {createServerMutation.error.message}
                            </p>
                        )}

                        {/* Submit Button */}
                        <DialogFooter className="px-0 pb-0">
                            <Button
                                type="submit"
                                disabled={createServerMutation.isPending || isUploading || profileLoading || !profile}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
                            >
                                {isUploading
                                    ? "Uploading..."
                                    : createServerMutation.isPending
                                        ? "Creating..."
                                        : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
