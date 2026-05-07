"use client";
import * as React from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { taxonomiesApi } from "@/lib/api/taxonomies";
import { qk } from "@/lib/queries/keys";
import { MAX_TAGS_PER_PROMPT } from "@/lib/constants";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
}

export function TagInput({ value, onChange, invalid }: TagInputProps) {
  const [text, setText] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const { data: tags } = useQuery({
    queryKey: qk.taxonomies.tags,
    queryFn: () => taxonomiesApi.tags().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const suggestions = React.useMemo(() => {
    if (!text.trim()) return [];
    const t = text.toLowerCase();
    return (tags ?? [])
      .filter((tag) => tag.name.toLowerCase().includes(t) && !value.includes(tag.name))
      .slice(0, 6);
  }, [text, tags, value]);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    if (value.includes(tag)) return;
    if (value.length >= MAX_TAGS_PER_PROMPT) return;
    onChange([...value, tag]);
    setText("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(text);
    } else if (e.key === "Backspace" && !text && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-md p-2 bg-white transition-shadow ${
          invalid ? "shadow-[rgba(185,28,28,0.4)_0_0_0_1px]" : "shadow-ring-light"
        } focus-within:shadow-[var(--color-focus)_0_0_0_2px]`}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="blue" className="gap-1 pr-1">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/40"
              aria-label={`Quitar ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length === 0 ? "agrega tags y presiona Enter…" : ""}
          className="flex-1 min-w-[120px] h-7 px-1 shadow-none focus:shadow-none"
        />
      </div>
      <div className="text-xs text-[var(--color-fg-muted)] mt-1">
        {value.length}/{MAX_TAGS_PER_PROMPT} tags
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-card z-20 p-1">
          {suggestions.map((s) => (
            <button
              type="button"
              key={s.id}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[var(--color-bg-subtle)]"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s.name);
              }}
            >
              #{s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
