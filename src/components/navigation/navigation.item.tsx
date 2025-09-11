"use client";

import { ActionTooltip } from "@/components/action.tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItemProps {
    id: string;
    name: string;
    imageUrl: string | null;
}

export const NavigationItem = ({ id, name, imageUrl }: NavigationItemProps) => {
    const pathname = usePathname();
    const href = `/servers/${id}`;

    const active = pathname?.startsWith(href);

    return (
        <ActionTooltip
            side="right"
            align="center"
            label={name}
        >
            <Link
                href={href}
                className={cn(
                    "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ease-out overflow-hidden border-2 flex-shrink-0",
                    "hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 hover:ring-1 hover:ring-blue-400/30",
                    active
                        ? "bg-gradient-to-br from-blue-500/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400/50 border-blue-400/60"
                        : "bg-gradient-to-br from-muted/30 to-muted/20 text-foreground hover:from-blue-500/60 hover:to-purple-600/60 hover:text-white border-muted-foreground/20 hover:border-blue-400/40"
                )}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        width={48}
                        height={48}
                        className="h-full w-full rounded-2xl object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 group-hover:shadow-inner group-hover:shadow-blue-400/20"
                    />
                ) : (
                    <span className="text-lg font-semibold select-none text-foreground group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:font-bold">
                        {name.charAt(0).toUpperCase()}
                    </span>
                )}

                {/* Pill indicator */}
                <span
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-r-full transition-all duration-500 shadow-sm",
                        "group-hover:h-6 group-hover:shadow-blue-400/40",
                        active ? "h-8 shadow-blue-500/60" : "h-0"
                    )}
                />
            </Link>
        </ActionTooltip>
    );
};
