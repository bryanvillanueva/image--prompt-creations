"use client";
import * as React from "react";
import * as RDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export const DropdownMenu = RDropdown.Root;
export const DropdownMenuTrigger = RDropdown.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RDropdown.Content>,
  React.ComponentPropsWithoutRef<typeof RDropdown.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RDropdown.Portal>
    <RDropdown.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] rounded-md bg-white p-1 shadow-card",
        className,
      )}
      {...props}
    />
  </RDropdown.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RDropdown.Item>,
  React.ComponentPropsWithoutRef<typeof RDropdown.Item>
>(({ className, ...props }, ref) => (
  <RDropdown.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
      "focus:bg-[var(--color-bg-subtle)] data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RDropdown.Separator>,
  React.ComponentPropsWithoutRef<typeof RDropdown.Separator>
>(({ className, ...props }, ref) => (
  <RDropdown.Separator
    ref={ref}
    className={cn("my-1 h-px bg-[var(--color-border)]", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RDropdown.Label>,
  React.ComponentPropsWithoutRef<typeof RDropdown.Label>
>(({ className, ...props }, ref) => (
  <RDropdown.Label
    ref={ref}
    className={cn("px-3 py-1.5 text-xs text-[var(--color-fg-muted)]", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";
