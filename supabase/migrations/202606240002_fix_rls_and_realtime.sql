-- Hapus policy write lama yang pakai authenticated
drop policy if exists "admins can maintain locker status" on public.locker_status;
drop policy if exists "admins can maintain access logs" on public.access_logs;

-- Buat policy baru untuk service_role (dipakai API endpoint /api/iot/events)
create policy "service role can manage locker_status"
  on public.locker_status for all
  to service_role
  using (true)
  with check (true);

create policy "service role can manage access_logs"
  on public.access_logs for all
  to service_role
  using (true)
  with check (true);

-- Pastikan access_logs ada di realtime publication (yg kedua mungkin blm terdaftar)
alter publication supabase_realtime add table public.access_logs;
