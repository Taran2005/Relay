// components/navigation/NavigationAction.tsx

"use client";

import { ActionTooltip } from "@/components/action.tooltip";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { Plus } from "lucide-react";

export const NavigationAction = () => {
    const { onOpen } = useModalStore();

    return (
        <>
            <ActionTooltip side="right" align="center" label="Add a Server">
                <button
                    onClick={() => onOpen("createServer")}
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/30 to-muted/20 hover:from-blue-500/70 hover:to-purple-600/70 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 border-2 border-muted-foreground/20 hover:border-blue-400/50 hover:ring-1 hover:ring-blue-400/30"
                >
                    <Plus className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 drop-shadow-sm" />
                </button>
            </ActionTooltip>
        </>
    );
};
