-- Open access: no Supabase Auth required for guest portal

alter table public.profiles alter column user_id drop not null;
alter table public.rides alter column user_id drop not null;
alter table public.board_posts alter column user_id drop not null;
alter table public.board_replies alter column user_id drop not null;

alter table public.rides add column if not exists author_name text;
alter table public.board_posts add column if not exists author_name text;
alter table public.board_replies add column if not exists author_name text;

alter table public.profiles drop constraint if exists profiles_user_id_fkey;
alter table public.rides drop constraint if exists rides_user_id_fkey;
alter table public.board_posts drop constraint if exists board_posts_user_id_fkey;
alter table public.board_replies drop constraint if exists board_replies_user_id_fkey;

drop policy if exists "Authenticated users can view all profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Authenticated users can view all rides" on public.rides;
drop policy if exists "Users can insert their own rides" on public.rides;
drop policy if exists "Users can update their own rides" on public.rides;
drop policy if exists "Users can delete their own rides" on public.rides;
drop policy if exists "Authenticated users can view all board posts" on public.board_posts;
drop policy if exists "Users can insert their own board posts" on public.board_posts;
drop policy if exists "Users can update their own board posts" on public.board_posts;
drop policy if exists "Users can delete their own board posts" on public.board_posts;
drop policy if exists "Authenticated users can view all board replies" on public.board_replies;
drop policy if exists "Users can insert their own board replies" on public.board_replies;
drop policy if exists "Users can update their own board replies" on public.board_replies;
drop policy if exists "Users can delete their own board replies" on public.board_replies;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public insert profiles" on public.profiles for insert with check (true);
create policy "Public update profiles" on public.profiles for update using (true) with check (true);
create policy "Public delete profiles" on public.profiles for delete using (true);

create policy "Public read rides" on public.rides for select using (true);
create policy "Public insert rides" on public.rides for insert with check (true);
create policy "Public update rides" on public.rides for update using (true) with check (true);
create policy "Public delete rides" on public.rides for delete using (true);

create policy "Public read board posts" on public.board_posts for select using (true);
create policy "Public insert board posts" on public.board_posts for insert with check (true);
create policy "Public update board posts" on public.board_posts for update using (true) with check (true);
create policy "Public delete board posts" on public.board_posts for delete using (true);

create policy "Public read board replies" on public.board_replies for select using (true);
create policy "Public insert board replies" on public.board_replies for insert with check (true);
create policy "Public update board replies" on public.board_replies for update using (true) with check (true);
create policy "Public delete board replies" on public.board_replies for delete using (true);
