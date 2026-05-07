"use client";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";

export function MultiSelectDropdown({
  label,
  items,
  values,
  onChange,
}: {
  label: string;
  items: string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (val: string) => {
    const set = new Set(values);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm">
        {label}
      </Dropdown.Trigger>
      <Dropdown.Content className="z-50 rounded-xl border border-black/10 bg-white p-1 shadow-lg">
        {items.map((it) => {
          const active = values.includes(it);
          return (
            <Dropdown.Item
              key={it}
              onSelect={(e) => { e.preventDefault(); toggle(it); }}
              className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-black/5"
            >
              <span className="h-4 w-4 rounded-full border border-black/10 bg-white grid place-content-center">
                {active && <Check className="h-3 w-3" />}
              </span>
              <span>{it}</span>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}