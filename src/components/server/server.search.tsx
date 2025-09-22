"use client";

import * as React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServerSearchProps {
    data: {
        label: string;
        type: "channel" | "member";
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
        }[];
    }[];
    serverId: string;
}

export function ServerSearch({ data, serverId }: ServerSearchProps) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    // keyboard shortcut: ⌘K / Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const onSelect = (id: string, type: "channel" | "member") => {
        setOpen(false);
        if (type === "channel") {
            router.push(`/servers/${serverId}/channels/${id}`);
        } else {
            router.push(`/servers/${serverId}/conversations/${id}`);
        }
    };

    const handleSearchClick = React.useCallback(() => {
        setOpen(true);
    }, []);

    return (
        <>
            <button 
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 text-left"
                onClick={handleSearchClick}
                type="button"
            >
                <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
                        Search
                    </span>
                </div>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg">
                    <DialogTitle className="sr-only">Search channels and members</DialogTitle>
                    <DialogDescription className="sr-only">
                        Search for channels and members in this server
                    </DialogDescription>
                    <Command className="rounded-lg border shadow-md">
                        <CommandInput placeholder="Search channels and members..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {data.map((group) => (
                                <CommandGroup key={group.label} heading={group.label}>
                                    {group.data.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.name}
                                            onSelect={() => onSelect(item.id, group.type)}
                                            className="flex items-center gap-2"
                                        >
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}