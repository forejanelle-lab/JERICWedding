-- Daily ride digest queue (new posts only) plus unsubscribe list.
create table if not exists public.ride_digest_store (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ride_digest_store enable row level security;

drop policy if exists "ride_digest_read" on public.ride_digest_store;
drop policy if exists "ride_digest_insert" on public.ride_digest_store;
drop policy if exists "ride_digest_update" on public.ride_digest_store;

create policy "ride_digest_read" on public.ride_digest_store for select using (true);
create policy "ride_digest_insert" on public.ride_digest_store for insert with check (true);
create policy "ride_digest_update" on public.ride_digest_store for update using (true);

insert into public.ride_digest_store (id, payload)
values ('live', '{"subscribers":[],"unsubscribed":[],"posts":[],"sentPostIds":[]}'::jsonb)
on conflict (id) do nothing;
