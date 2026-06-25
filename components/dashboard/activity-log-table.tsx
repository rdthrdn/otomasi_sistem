import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccessLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type ActivityLogTableProps = {
  logs: AccessLog[];
};

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-2 border-b border-black/10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Riwayat akses RFID</CardTitle>
          <CardDescription>Aktivitas terbaru dari card dan keyfob yang dipindai.</CardDescription>
        </div>
        <Badge>{logs.length} event terakhir</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-[0.18em] text-[#756f63]">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">UID</th>
                <th className="px-6 py-4 font-semibold">Result</th>
                <th className="px-6 py-4 font-semibold">Locker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const granted = log.result === "ACCESS GRANTED";
                  return (
                    <tr key={log.id} className="transition hover:bg-white/35">
                      <td className="px-6 py-4 text-[#4d463b]">{formatDateTime(log.created_at)}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-[#201a12]">{log.uid}</td>
                      <td className="px-6 py-4">
                        <Badge tone={granted ? "success" : "danger"}>{log.result}</Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#756f63]">{log.locker_id?.slice(0, 8) ?? "—"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#756f63]">
                    Belum ada aktivitas RFID. Data akan muncul setelah ESP32 mengirim event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
