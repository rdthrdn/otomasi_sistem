import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type EventPayload = {
  uid?: string;
  current_weight?: number;
  threshold?: number;
  create_log?: boolean;
};

function normalizeUid(uid?: string) {
  return uid?.trim().toUpperCase().replace(/[^A-F0-9]/g, "") ?? "";
}

export async function POST(request: Request) {
  const deviceKey = process.env.IOT_DEVICE_KEY;
  const providedKey = request.headers.get("x-device-key");

  if (!deviceKey || providedKey !== deviceKey) {
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
  }

  let payload: EventPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const uid = normalizeUid(payload.uid);
  const currentWeight = Number(payload.current_weight ?? 0);
  const threshold = Number(payload.threshold ?? 50);
  const createLog = payload.create_log === true;

  const occupied = currentWeight > threshold;
  const supabase = createAdminClient();

  // Cari row locker_status yang sudah ada
  const { data: existingStatus } = await supabase
    .from("locker_status")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingStatus?.id) {
    // First time — insert row
    const ownerUid = uid || "UNKNOWN";
    const result = "ACCESS GRANTED";

    const { data: newStatus, error: insertError } = await supabase
      .from("locker_status")
      .insert({
        owner_uid: ownerUid,
        occupied,
        current_weight: Math.round(currentWeight),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (createLog && uid) {
      await supabase.from("access_logs").insert({
        locker_id: newStatus.id,
        uid,
        result,
      });
    }

    return NextResponse.json({ status: newStatus, access: result, threshold });
  }

  // Update existing row — SELALU update biar weight realtime
  const ownerUid = existingStatus.owner_uid ?? uid;
  const result = uid ? (ownerUid === uid ? "ACCESS GRANTED" : "ACCESS DENIED") : "STATUS_UPDATE";

  const { data: updatedStatus, error: updateError } = await supabase
    .from("locker_status")
    .update({
      owner_uid: uid ? ownerUid : existingStatus.owner_uid,
      occupied,
      current_weight: Math.round(currentWeight),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingStatus.id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Cuma buat log kalau create_log: true DAN ada uid (scan kartu)
  if (createLog && uid) {
    await supabase.from("access_logs").insert({
      locker_id: updatedStatus.id,
      uid,
      result: result.startsWith("ACCESS") ? result : "ACCESS GRANTED",
    });
  }

  return NextResponse.json({
    status: updatedStatus,
    access: result,
    threshold,
  });
}
