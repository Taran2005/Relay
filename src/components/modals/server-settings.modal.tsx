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

import { useModalStore } from "@/lib/hooks/use-modal-store";
import { useUpdateServer } from "@/lib/hooks/use-update-server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import * as z from "zod";

// 🔹 Validation Schema
const formSchema = z.object({
    serverName: z
        .string()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(30, { message: "Name must be at most 30 characters long" }),
    serverImage: z.string().optional(),
});

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const ServerSettingsModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "serverSettings";
    const [isUploading, setIsUploading] = useState(false);

    const { data: profile } = useSWR('/api/currentProfile', fetcher);
    const { updateServer, loading: isLoading, error: updateError } = useUpdateServer(profile?.id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serverName: "",
            serverImage: "",
        },
    });

    // Pre-populate form with current server data
    useEffect(() => {
        if (data.server && isModalOpen) {
            form.reset({
                serverName: data.server.name,
                serverImage: data.server.imageUrl || "",
            });
        }
    }, [data.server, isModalOpen, form]);

    // 🔹 Handle Form Submit
    const onSubmit = async (formData: z.infer<typeof formSchema>) => {
        try {
            if (!data.server) return;

            await updateServer(data.server.id, {
                name: formData.serverName,
                imageUrl: formData.serverImage || null
            });
            form.reset();
            onClose();
        } catch {
            // Error handled in hook
        }
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
                        Server Settings
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Update your server&apos;s name and image. Changes will be visible to all members.
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
                                            disabled={isLoading}
                                            placeholder="Enter server name"
                                            className="h-10 border-zinc-100"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {updateError && <p className="text-red-500 text-sm">{updateError}</p>}

                        {/* Submit Button */}
                        <DialogFooter className="px-0 pb-0">
                            <Button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
                            >
                                {isUploading
                                    ? "Uploading..."
                                    : isLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};