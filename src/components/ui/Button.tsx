
import type { ButtonHTMLAttributes } from "react";

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-black/5 bg-white px-4 py-2 text-sm font-medium shadow-sm",
        "hover:bg-black/5 active:translate-y-[1px]",
        className
      )}
      {...props}
    />
  );
}

export function cn(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}