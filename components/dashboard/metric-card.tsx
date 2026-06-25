import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "danger" | "warning";
};

const toneStyles = {
  neutral: "bg-black/[0.04] text-[#4d463b]",
  success: "bg-[#2f7d57]/10 text-[#225d42]",
  danger: "bg-[#b94a3f]/10 text-[#963a31]",
  warning: "bg-[#c76f37]/12 text-[#8f3f1f]",
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "neutral" }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#756f63]">{label}</p>
          <div>
            <p className="truncate font-display text-3xl font-semibold tracking-[-0.05em] text-[#201a12]">{value}</p>
            <p className="mt-2 text-sm leading-6 text-[#756f63]">{detail}</p>
          </div>
        </div>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", toneStyles[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
