"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionTooltipProps {
  label?: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const ActionTooltip = ({
  label,
  children,
  side,
  align,
}: ActionTooltipProps) => {
  // If no label is provided, just return the children without tooltip
  if (!label) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className="bg-gradient-to-br from-popover via-popover to-popover/95 backdrop-blur-xl border border-border/50 shadow-xl text-popover-foreground px-3 py-2 rounded-lg"
      >
        <p className="font-semibold text-sm capitalize bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {label.toLowerCase()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
