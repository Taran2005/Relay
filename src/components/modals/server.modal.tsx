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
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FileUpload } from "@/components/fileupload";

import { useCreateServer } from "@/lib/hooks/use-create-server";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // ✅ Import router
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

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const CreateServerModal = () => {
    const router = useRouter(); // ✅ Next.js router
    const { isOpen, type, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "createServer";
    const [isUploading, setIsUploading] = useState(false);

    const { data: profile } = useSWR('/api/currentProfile', fetcher);
    const { createServer, loading: isLoading, error: createError } = useCreateServer(profile?.id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serverName: "",
            serverImage: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const newServer = await createServer({ name: data.serverName, imageUrl: data.serverImage || null });
            form.reset();
            onClose();
            if (newServer) {
                router.push(`/servers/${newServer.id}`);
            }
        } catch {

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

                        {createError && <p className="text-red-500 text-sm">{createError}</p>}

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
