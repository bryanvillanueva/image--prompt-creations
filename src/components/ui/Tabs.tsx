"use client";
import * as React from "react";
import * as RTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = RTabs.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RTabs.List>,
  React.ComponentPropsWithoutRef<typeof RTabs.List>
>(({ className, ...props }, ref) => (
  <RTabs.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-subtle)] p-1 shadow-ring-light",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RTabs.Trigger>
>(({ className, ...props }, ref) => (
  <RTabs.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-7 items-center rounded-full px-3 text-sm font-medium text-[var(--color-fg-muted)] transition-colors",
      "data-[state=active]:bg-white data-[state=active]:text-[var(--color-fg)] data-[state=active]:shadow-ring-light",
      "hover:text-[var(--color-fg)]",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = RTabs.Content;
