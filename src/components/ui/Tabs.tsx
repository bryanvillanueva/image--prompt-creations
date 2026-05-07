"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "./Button";

export function UITabs({
  value,
  onValueChange,
  tabs,
}: {
  value: string;
  onValueChange: (v: string) => void;
  tabs: { value: string; label: string }[];
}) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List className="flex w-full flex-wrap gap-2">
        {tabs.map((t) => (
          <Tabs.Trigger
            key={t.value}
            value={t.value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              "border-black/10 bg-white text-black shadow-sm",
              "hover:bg-black/5 data-[state=active]:bg-black data-[state=active]:text-white"
            )}
          >
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}