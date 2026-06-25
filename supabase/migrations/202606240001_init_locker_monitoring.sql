create extension if not exists "pgcrypto";

create table if not exists public.locker_status (
  id uuid primary key default gen_random_uuid(),
  owner_uid text,
  occupied boolean not null default false,
  current_weight bigint not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  locker_id uuid references public.locker_status(id) on delete set null,
  uid text not null,
  result text not null check (result in ('ACCESS GRANTED', 'ACCESS DENIED')),
  created_at timestamptz not null default now()
);

create index if not exists locker_status_updated_at_idx on public.locker_status (updated_at desc);
create index if not exists access_logs_created_at_idx on public.access_logs (created_at desc);
create index if not exists access_logs_locker_id_created_at_idx on public.access_logs (locker_id, created_at desc);

alter table public.locker_status enable row level security;
alter table public.access_logs enable row level security;

drop policy if exists "admins can read locker status" on public.locker_status;
create policy "admins can read locker status"
  on public.locker_status for select
  to authenticated
  using (true);

drop policy if exists "admins can read access logs" on public.access_logs;
create policy "admins can read access logs"
  on public.access_logs for select
  to authenticated
  using (true);

drop policy if exists "admins can maintain locker status" on public.locker_status;
create policy "admins can maintain locker status"
  on public.locker_status for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admins can maintain access logs" on public.access_logs;
create policy "admins can maintain access logs"
  on public.access_logs for all
  to authenticated
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'locker_status'
  ) then
    alter publication supabase_realtime add table public.locker_status;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'access_logs'
  ) then
    alter publication supabase_realtime add table public.access_logs;
  end if;
end $$;

insert into public.locker_status (owner_uid, occupied, current_weight)
select null, false, 0
where not exists (select 1 from public.locker_status);
