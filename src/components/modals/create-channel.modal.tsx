"use client";

import React from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

import { useCreateChannel } from "@/lib/hooks/use-create-channel";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChannelType } from "@prisma/client";
import { ChevronDown, Hash, Mic, Video } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 🔹 Validation Schema
const formSchema = z.object({
    channelName: z
        .string()
        .min(1, { message: "Channel name is required" })
        .max(100, { message: "Channel name must be at most 100 characters long" }),
    channelType: z.nativeEnum(ChannelType),
});

const channelTypeIcons = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
};

const channelTypeLabels = {
    [ChannelType.TEXT]: "Text",
    [ChannelType.AUDIO]: "Voice",
    [ChannelType.VIDEO]: "Video",
};

export const CreateChannelModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const isModalOpen = isOpen && type === "createChannel";
    const server = data?.server;

    const { createChannel, loading: isLoading, error: createError } = useCreateChannel();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            channelName: "",
            channelType: ChannelType.TEXT,
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (!server) return;

            await createChannel({
                name: data.channelName,
                type: data.channelType,
                serverId: server.id,
            });

            form.reset();
            onClose();
        } catch {
            // Error is handled by the hook
        }
    };

    useEffect(() => {
        if (!isModalOpen) {
            form.reset();
        }
    }, [isModalOpen, form]);

    if (!server) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={() => { if (isModalOpen) onClose(); }}>
            <DialogContent className="bg-background text-foreground p-6 overflow-hidden border-0 shadow-lg rounded-lg max-w-md">
                <DialogHeader className="pt-0 px-0">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Create Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        Give your channel a name and select its type.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Channel Type Selection */}
                        <FormField
                            control={form.control}
                            name="channelType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Channel Type
                                    </FormLabel>
                                    <FormControl>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-between h-10"
                                                    disabled={isLoading}
                                                >
                                                    <div className="flex items-center">
                                                        {React.createElement(channelTypeIcons[field.value], {
                                                            className: "mr-2 h-4 w-4"
                                                        })}
                                                        {channelTypeLabels[field.value]}
                                                    </div>
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full">
                                                {Object.values(ChannelType).map((type) => {
                                                    const Icon = channelTypeIcons[type];
                                                    return (
                                                        <DropdownMenuItem
                                                            key={type}
                                                            onClick={() => field.onChange(type)}
                                                            className="flex items-center"
                                                        >
                                                            <Icon className="mr-2 h-4 w-4" />
                                                            {channelTypeLabels[type]}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Channel Name Field */}
                        <FormField
                            control={form.control}
                            name="channelName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Channel Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Enter channel name"
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
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10"
                            >
                                {isLoading ? "Creating..." : "Create Channel"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};