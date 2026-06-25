import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning";
  className?: string;
};

const tones = {
  neutral: "border-black/10 bg-black/[0.04] text-[#4d463b]",
  success: "border-[#2f7d57]/20 bg-[#2f7d57]/10 text-[#225d42]",
  danger: "border-[#b94a3f]/20 bg-[#b94a3f]/10 text-[#963a31]",
  warning: "border-[#c76f37]/25 bg-[#c76f37]/12 text-[#8f3f1f]",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
