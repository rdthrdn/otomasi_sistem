import { redirect } from "next/navigation";
import { LockerDashboard } from "@/components/dashboard/locker-dashboard";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import type { AccessLog, LockerStatus } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: status }, { data: logs }] = await Promise.all([
    supabase.from("locker_status").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("access_logs").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <main className="relative min-h-screen px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#756f63]">Smart RFID Locker Monitoring</p>
            <p className="mt-2 text-sm text-[#756f63]">ESP32 · RC522 · HX711 · Supabase</p>
          </div>
          <SignOutButton />
        </header>

        <LockerDashboard
          initialStatus={(status as LockerStatus | null) ?? null}
          initialLogs={(logs as AccessLog[] | null) ?? []}
          userEmail={user.email}
        />
      </div>
    </main>
  );
}
