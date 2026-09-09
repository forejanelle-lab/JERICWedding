-- Guest Portal schema for Janelle & Eric wedding site

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  region text not null check (region in ('us', 'europe')),
  home_city text,
  arrival_date date,
  departure_date date,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rides
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('offer', 'request')),
  from_location text not null,
  to_location text not null,
  ride_date date not null,
  seats integer not null default 1 check (seats > 0),
  notes text,
  region_tag text check (region_tag in ('us', 'europe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Board posts
create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (
    category in ('general', 'travel_tips', 'meetups', 'us_travelers', 'europe_guests')
  ),
  title text not null,
  body text not null,
  region_tag text check (region_tag in ('us', 'europe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Board replies
create table if not exists public.board_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists rides_updated_at on public.rides;
create trigger rides_updated_at
  before update on public.rides
  for each row execute function public.set_updated_at();

drop trigger if exists board_posts_updated_at on public.board_posts;
create trigger board_posts_updated_at
  before update on public.board_posts
  for each row execute function public.set_updated_at();

-- Indexes
create index if not exists profiles_region_idx on public.profiles(region);
create index if not exists rides_ride_date_idx on public.rides(ride_date);
create index if not exists rides_region_tag_idx on public.rides(region_tag);
create index if not exists board_posts_category_idx on public.board_posts(category);
create index if not exists board_posts_created_at_idx on public.board_posts(created_at desc);
create index if not exists board_replies_post_id_idx on public.board_replies(post_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.rides enable row level security;
alter table public.board_posts enable row level security;
alter table public.board_replies enable row level security;

-- Profiles policies
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Rides policies
create policy "Authenticated users can view all rides"
  on public.rides for select
  to authenticated
  using (true);

create policy "Users can insert their own rides"
  on public.rides for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own rides"
  on public.rides for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own rides"
  on public.rides for delete
  to authenticated
  using (auth.uid() = user_id);

-- Board posts policies
create policy "Authenticated users can view all board posts"
  on public.board_posts for select
  to authenticated
  using (true);

create policy "Users can insert their own board posts"
  on public.board_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own board posts"
  on public.board_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own board posts"
  on public.board_posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- Board replies policies
create policy "Authenticated users can view all board replies"
  on public.board_replies for select
  to authenticated
  using (true);

create policy "Users can insert their own board replies"
  on public.board_replies for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own board replies"
  on public.board_replies for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own board replies"
  on public.board_replies for delete
  to authenticated
  using (auth.uid() = user_id);
