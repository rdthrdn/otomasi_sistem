import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-black/10 bg-white/55 px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-[#c76f37]/60 focus:ring-4 focus:ring-[#c76f37]/15",
        className,
      )}
      {...props}
    />
  );
}
