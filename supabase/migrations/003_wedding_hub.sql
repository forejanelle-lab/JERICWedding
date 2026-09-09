-- Full wedding hub schema (ready for Supabase).
-- Prototype currently persists in the browser; run this when connecting a live backend.

create extension if not exists "pgcrypto";

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text unique,
  city text,
  side text not null check (side in ('janelle', 'eric', 'both')),
  guest_group text,
  stay_area text,
  events text[] not null default '{}',
  points integer not null default 0,
  attending boolean not null default true,
  dietary text,
  arrival_airport text,
  arrival_date date,
  departure_date date,
  show_in_directory boolean not null default true,
  show_city boolean not null default true,
  show_events boolean not null default true,
  allow_contact boolean not null default true,
  show_on_leaderboard boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references public.guests(id) on delete set null,
  name text not null,
  email text,
  attending boolean not null,
  events text[] not null default '{}',
  guest_count integer not null default 1,
  dietary text,
  song text,
  airport text,
  arrival_date date,
  departure_date date,
  stay_area text,
  created_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.guests(id) on delete cascade,
  kind text not null check (kind in ('offer', 'request')),
  from_location text not null,
  to_location text not null,
  ride_date date not null,
  ride_time time not null,
  seats integer not null default 1,
  seats_taken integer not null default 0,
  luggage text,
  notes text,
  status text not null default 'open' check (status in ('open', 'pending', 'confirmed', 'full')),
  created_at timestamptz not null default now()
);

create table if not exists public.seat_asks (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  from_guest_id uuid not null references public.guests(id) on delete cascade,
  seats integer not null default 1,
  note text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  author_id uuid references public.guests(id) on delete set null,
  body text not null,
  reply_to uuid references public.chat_messages(id) on delete set null,
  hearts uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.guests(id) on delete set null,
  author_name text not null,
  body text not null,
  photo_url text,
  hearts uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  category text not null,
  suggested_by text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.song_votes (
  song_id uuid not null references public.songs(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  primary key (song_id, guest_id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.guests(id) on delete set null,
  album text not null,
  caption text,
  src text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  published_at timestamptz not null default now()
);

create table if not exists public.game_scores (
  guest_id uuid not null references public.guests(id) on delete cascade,
  game_id text not null,
  points integer not null default 0,
  primary key (guest_id, game_id)
);

create table if not exists public.saved_places (
  guest_id uuid not null references public.guests(id) on delete cascade,
  place_id text not null,
  primary key (guest_id, place_id)
);

alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.rides enable row level security;
alter table public.seat_asks enable row level security;
alter table public.chat_messages enable row level security;
alter table public.guestbook enable row level security;
alter table public.songs enable row level security;
alter table public.song_votes enable row level security;
alter table public.photos enable row level security;
alter table public.announcements enable row level security;
alter table public.game_scores enable row level security;
alter table public.saved_places enable row level security;
