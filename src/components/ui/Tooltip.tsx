"use client";
import * as React from "react";
import * as RTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export const TooltipProvider = RTooltip.Provider;
export const Tooltip = RTooltip.Root;
export const TooltipTrigger = RTooltip.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RTooltip.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RTooltip.Portal>
    <RTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md bg-[var(--color-fg)] px-2 py-1 text-xs text-white shadow-lg",
        className,
      )}
      {...props}
    />
  </RTooltip.Portal>
));
TooltipContent.displayName = "TooltipContent";
