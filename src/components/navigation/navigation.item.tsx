"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action.tooltip";

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
                    "group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-muted/30 text-sm font-medium transition-all",
                    "hover:rounded-2xl hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active && "rounded-2xl bg-emerald-500 text-white"
                )}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        width={48}
                        height={48}
                        className="h-full w-full rounded-inherit object-cover"
                    />
                ) : (
                    <span className="text-lg font-semibold select-none text-foreground group-hover:text-white">
                        {name.charAt(0).toUpperCase()}
                    </span>
                )}

                {/* Pill indicator */}
                <span
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-emerald-500 transition-all duration-300",
                        "group-hover:h-5",
                        active ? "h-8" : "h-0"
                    )}
                />
            </Link>
        </ActionTooltip>
    );
};
