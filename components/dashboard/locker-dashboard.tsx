"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, KeyRound, PackageCheck, Radio, Scale3D, ShieldCheck } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ActivityLogTable } from "@/components/dashboard/activity-log-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SystemPanel } from "@/components/dashboard/system-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { AccessLog, LockerStatus } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

type LockerDashboardProps = {
  initialStatus: LockerStatus | null;
  initialLogs: AccessLog[];
  userEmail?: string | null;
};

type RealtimeState = "connecting" | "online" | "offline";

export function LockerDashboard({ initialStatus, initialLogs, userEmail }: LockerDashboardProps) {
  const [status, setStatus] = useState<LockerStatus | null>(initialStatus);
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs);
  const [connection, setConnection] = useState<RealtimeState>("connecting");
  const [cardDetected, setCardDetected] = useState<{ uid: string; result: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("locker-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locker_status" },
        (payload: RealtimePostgresChangesPayload<LockerStatus>) => {
          console.log("[REALTIME] locker_status event:", payload.eventType, payload.new);
          if (payload.eventType !== "DELETE") {
            setStatus(payload.new);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_logs" },
        (payload: RealtimePostgresChangesPayload<AccessLog>) => {
          console.log("[REALTIME] access_logs INSERT:", payload.new);
          setLogs((current) => [payload.new, ...current].slice(0, 10));

          // Show card detection notification
          setCardDetected({ uid: payload.new.uid, result: payload.new.result });
          setTimeout(() => setCardDetected(null), 4000);
        },
      )
      .subscribe((state) => {
        console.log("[REALTIME] Channel state:", state);
        setConnection(state === "SUBSCRIBED" ? "online" : state === "CHANNEL_ERROR" ? "offline" : "connecting");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const lastLog = logs[0];
  const occupied = Boolean(status?.occupied);
  const statusLabel = occupied ? "OCCUPIED" : "EMPTY";
  const weightLabel = typeof status?.current_weight === "number" ? `${status.current_weight.toLocaleString("id-ID")} g` : "—";

  const accessStats = useMemo(() => {
    const granted = logs.filter((log) => log.result === "ACCESS GRANTED").length;
    const denied = logs.filter((log) => log.result === "ACCESS DENIED").length;
    return { granted, denied };
  }, [logs]);

  return (
    <div className="space-y-7">
      {/* Card Detection Notification */}
      {cardDetected && (
        <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="card-surface flex items-center gap-4 rounded-2xl border-2 border-[#c76f37] p-5 shadow-2xl">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#c76f37]/20">
              <Radio className="size-7 text-[#8f3f1f]" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-[-0.03em] text-[#201a12]">Card Detected!</p>
              <p className="mt-1 font-mono text-sm font-semibold text-[#756f63]">{cardDetected.uid}</p>
              <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                cardDetected.result === "ACCESS GRANTED" ? "text-[#2f7d57]" : "text-[#b94a3f]"
              }`}>
                {cardDetected.result}
              </p>
            </div>
          </div>
        </div>
      )}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden p-7 md:p-9">
          <div className="absolute right-8 top-8 hidden h-36 w-36 rounded-full border border-black/10 md:block" />
          <div className="absolute right-16 top-16 hidden h-20 w-20 rounded-full border border-black/10 md:block" />
          <div className="relative max-w-2xl">
            <Badge tone={connection === "online" ? "success" : connection === "offline" ? "danger" : "warning"}>
              {connection === "online" ? "Realtime online" : connection === "offline" ? "Realtime offline" : "Menghubungkan realtime"}
            </Badge>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.07em] text-[#201a12] md:text-7xl">
              Loker RFID dalam satu layar.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#756f63]">
              Status barang, UID pemilik, scan terakhir, dan histori akses diperbarui langsung dari Supabase Realtime tanpa refresh manual.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#756f63]">Admin aktif</p>
              <p className="mt-3 break-all font-display text-2xl font-semibold tracking-[-0.04em] text-[#201a12]">{userEmail ?? "Supabase Auth"}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#2f7d57]/10 text-[#225d42]">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white/35 p-4">
              <p className="text-sm text-[#756f63]">Granted</p>
              <p className="mt-2 font-display text-3xl font-semibold text-[#225d42]">{accessStats.granted}</p>
            </div>
            <div className="rounded-3xl bg-white/35 p-4">
              <p className="text-sm text-[#756f63]">Denied</p>
              <p className="mt-2 font-display text-3xl font-semibold text-[#963a31]">{accessStats.denied}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Locker Status"
          value={statusLabel}
          detail={occupied ? "Load cell mendeteksi barang di dalam loker." : "Tidak ada beban melewati threshold."}
          icon={PackageCheck}
          tone={occupied ? "warning" : "success"}
        />
        <MetricCard label="Owner UID" value={status?.owner_uid ?? "Belum terdaftar"} detail="UID pertama menjadi owner saat belum ada pemilik." icon={KeyRound} />
        <MetricCard label="Last RFID Scan" value={lastLog?.uid ?? "—"} detail={lastLog ? lastLog.result : "Menunggu scan RFID pertama."} icon={Radio} tone={lastLog?.result === "ACCESS DENIED" ? "danger" : "neutral"} />
        <MetricCard label="Last Update" value={formatRelativeTime(status?.updated_at)} detail={`Berat saat ini: ${weightLabel}`} icon={Clock3} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#756f63]">Occupancy</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] text-[#201a12]">Sensor load cell</h2>
            </div>
            <Scale3D className="size-6 text-[#8f3f1f]" />
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div className="dial-shadow relative flex aspect-square w-64 items-center justify-center rounded-full border border-black/10 bg-[#fff8eb]/70">
              <div className="absolute inset-5 rounded-full border border-dashed border-black/15" />
              <div className="text-center">
                <p className="font-display text-5xl font-semibold tracking-[-0.06em] text-[#201a12]">{weightLabel}</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#756f63]">Current weight</p>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-sm leading-6 text-[#756f63]">
            Logika MVP: <span className="font-mono text-[#201a12]">diff &gt; threshold</span> berarti OCCUPIED, selain itu EMPTY.
          </p>
        </Card>

        <SystemPanel />
      </section>

      <ActivityLogTable logs={logs} />
    </div>
  );
}
