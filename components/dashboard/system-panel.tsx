import { Cpu, Database, Radio, Scale3D } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  { icon: Radio, label: "RFID RC522", detail: "UID card/keyfob" },
  { icon: Cpu, label: "ESP32", detail: "WiFi bridge" },
  { icon: Scale3D, label: "HX711", detail: "Load cell 1kg" },
  { icon: Database, label: "Supabase", detail: "Postgres realtime" },
];

export function SystemPanel() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.04em] text-[#201a12]">Alur sistem</h2>
          <p className="mt-1 text-sm text-[#756f63]">Dari scan fisik sampai update dashboard.</p>
        </div>
        <div className="rounded-full bg-[#201a12] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff8eb]">Live</div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.label} className="relative rounded-3xl border border-black/10 bg-white/35 p-4">
            <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-[#201a12]/[0.06] text-[#201a12]">
              <item.icon className="size-5" />
            </div>
            <p className="font-semibold text-[#201a12]">{item.label}</p>
            <p className="mt-1 text-sm text-[#756f63]">{item.detail}</p>
            {index < items.length - 1 ? <span className="absolute -right-2 top-1/2 hidden size-4 rounded-full bg-[#c76f37] md:block" /> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
