-- Set REPLICA IDENTITY FULL agar Supabase Realtime bisa broadcast UPDATE events dengan payload lengkap
alter table public.locker_status replica identity full;
alter table public.access_logs replica identity full;
