import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-[#201a12] text-[#fff8eb] hover:bg-[#2d2519]",
  ghost: "border border-black/10 bg-white/35 text-[#201a12] hover:bg-white/55",
  danger: "bg-[#b94a3f] text-white hover:bg-[#a13f35]",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
