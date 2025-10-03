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
import { Check, ChevronDown, Hash, Mic, Video } from "lucide-react";
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

    const createChannelMutation = useCreateChannel();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            channelName: "",
            channelType: data?.channelType || ChannelType.TEXT,
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        if (!server) return;

        createChannelMutation.mutate({
            name: data.channelName,
            type: data.channelType,
            serverId: server.id,
        }, {
            onSuccess: () => {
                form.reset();
                onClose();
            }
        });
    };

    useEffect(() => {
        if (isModalOpen && data?.channelType) {
            form.setValue("channelType", data.channelType);
        }
    }, [isModalOpen, data?.channelType, form]);

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
                                                    className="w-full justify-between h-12 px-4 bg-background border-2 border-input hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 rounded-lg shadow-sm"
                                                    disabled={createChannelMutation.isPending}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-1.5 rounded-md bg-primary/10">
                                                            {React.createElement(channelTypeIcons[field.value], {
                                                                className: "h-4 w-4 text-primary"
                                                            })}
                                                        </div>
                                                        <span className="font-medium text-foreground">
                                                            {channelTypeLabels[field.value]} Channel
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-full bg-background/95 backdrop-blur-xl border-2 border-border/50 shadow-xl rounded-lg p-1"
                                                align="start"
                                                sideOffset={5}
                                                style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
                                            >
                                                {Object.values(ChannelType).map((type) => {
                                                    const Icon = channelTypeIcons[type];
                                                    const isSelected = field.value === type;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={type}
                                                            onClick={() => field.onChange(type)}
                                                            className={`flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer transition-all duration-150 hover:bg-accent/80 ${isSelected
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-foreground hover:text-primary'
                                                                }`}
                                                        >
                                                            <div className={`p-1.5 rounded-md transition-colors duration-150 ${isSelected ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-primary/10'
                                                                }`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <span className="flex-1">
                                                                {channelTypeLabels[type]} Channel
                                                            </span>
                                                            {isSelected && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
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
                                            disabled={createChannelMutation.isPending}
                                            placeholder="Enter channel name"
                                            className="h-12 px-4 bg-background border-2 border-input hover:border-primary/50 focus:border-primary transition-all duration-200 rounded-lg shadow-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {createChannelMutation.error && (
                            <p className="text-red-500 text-sm">
                                {createChannelMutation.error.message}
                            </p>
                        )}

                        <DialogFooter className="px-0 pb-0">
                            <Button
                                type="submit"
                                disabled={createChannelMutation.isPending}
                                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-lg hover:shadow-xl font-medium text-base"
                            >
                                {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};