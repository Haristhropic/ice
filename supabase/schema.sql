-- =====================================================================
-- IceBreaker Hub - Postgres schema
--
-- Already applied to project kitkmdocxyomzstqlqbz as migrations
-- admin_backoffice and harden_trigger_function. This file is the source of
-- truth, not the live database.
--
-- To re-apply, use the Supabase MCP server's apply_migration tool, or paste
-- the whole file into Supabase Studio > SQL Editor and press Run. Then run
-- supabase/seed.sql, then create your login and promote yourself.
--
-- This script is idempotent. Re-running it will not destroy data.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. profiles  (PRD section 5.1 "users")
--
-- The PRD calls this table "users". It is named "profiles" here because
-- auth.users already exists and is owned by Supabase Auth. profiles is
-- our own table, 1:1 with it, holding the app-level role.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null default '',
  full_name  text,
  role       text not null default 'free'
             check (role in ('free', 'premium', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'App-level user profile, 1:1 with auth.users. role drives admin RLS policies.';


-- ---------------------------------------------------------------------
-- 2. icebreaker_ideas  (PRD section 5.2)
--
-- Column names follow PRD where practical, plus the extra fields the
-- existing catalog UI in src/lib/data.ts already renders.
-- ---------------------------------------------------------------------
create table if not exists public.icebreaker_ideas (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (length(btrim(title)) > 0),
  description       text not null default '',
  category          text not null default 'kelas'
                    check (category in ('kelas', 'rapat', 'workshop', 'pesta')),
  media             text not null default 'offline'
                    check (media in ('online', 'offline')),
  duration          text not null default 'quick'
                    check (duration in ('quick', 'medium', 'long')),
  duration_minutes  text not null default '1-3',
  age_group         text not null default 'lintas'
                    check (age_group in ('anak', 'remaja', 'dewasa', 'lintas')),
  min_players       integer not null default 2 check (min_players > 0),
  max_players       integer not null default 2 check (max_players >= min_players),
  bahan             text not null default '',
  photo_seed        text not null default '',
  steps             jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(steps) = 'array'),
  is_published      boolean not null default true,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.icebreaker_ideas is
  'Catalog of offline / low-tech icebreakers. Public can read published rows; only admins can write.';

create index if not exists ideas_published_idx
  on public.icebreaker_ideas (is_published, category);
create index if not exists ideas_updated_idx
  on public.icebreaker_ideas (updated_at desc);
create index if not exists ideas_created_by_idx
  on public.icebreaker_ideas (created_by);


-- ---------------------------------------------------------------------
-- 3. custom_templates  (PRD section 5.3)
-- ---------------------------------------------------------------------
create table if not exists public.custom_templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  tool_type    text not null
               check (tool_type in ('wheel', 'quiz', 'question_generator', 'timer', 'riddle')),
  title        text not null check (length(btrim(title)) > 0),
  content_data jsonb not null default '{}'::jsonb
               check (jsonb_typeof(content_data) = 'object'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.custom_templates is
  'User-saved wheel / quiz / question templates. Owners and admins can read and write.';

create index if not exists templates_user_idx
  on public.custom_templates (user_id, updated_at desc);


-- ---------------------------------------------------------------------
-- 4. game_rooms  (PRD section 5.4)
-- ---------------------------------------------------------------------
create table if not exists public.game_rooms (
  id               uuid primary key default gen_random_uuid(),
  room_code        text not null unique
                   check (room_code ~ '^[A-Z0-9]{4,8}$'),
  host_id          uuid references public.profiles (id) on delete set null,
  active_game_type text
                   check (active_game_type in ('click_race', 'quiz', 'wheel')),
  status           text not null default 'waiting'
                   check (status in ('waiting', 'playing', 'ended')),
  created_at       timestamptz not null default now(),
  ended_at         timestamptz
);

comment on table public.game_rooms is
  'Realtime rooms for the join-by-phone micro games (PRD phase 2).';

create index if not exists rooms_status_idx
  on public.game_rooms (status, created_at desc);
create index if not exists rooms_host_idx
  on public.game_rooms (host_id);


-- ---------------------------------------------------------------------
-- 5. Helper: is_admin()
--
-- SECURITY DEFINER is required, not optional. Without it, a profiles
-- SELECT policy that calls is_admin() would recurse into itself forever
-- the moment an admin loaded their own row. As SECURITY DEFINER the
-- function runs as the table owner and RLS on profiles does not apply.
--
-- It lives in a private schema so PostgREST never exposes it as an RPC
-- endpoint, and search_path is emptied so nothing can be substituted for
-- a same-named object at call time.
-- ---------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

drop function if exists public.is_admin();


-- ---------------------------------------------------------------------
-- 6. Helper: touch_updated_at()
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ideas_touch on public.icebreaker_ideas;
create trigger ideas_touch
  before update on public.icebreaker_ideas
  for each row execute function public.touch_updated_at();

drop trigger if exists templates_touch on public.custom_templates;
create trigger templates_touch
  before update on public.custom_templates
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
-- 7. Helper: auto-create a profile when someone signs up
--
-- Lives in the private schema with EXECUTE revoked from anon and
-- authenticated: it is a trigger function, never a REST endpoint. Trigger
-- functions are not privilege-checked when they fire, so the trigger still
-- works and the new user can still insert only their own profile row.
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();


-- =====================================================================
-- 8. Row Level Security
--
-- The publishable key in .env.local is public. These policies are the
-- only thing standing between "anyone" and your catalog. Do not skip
-- this section, and do not add a permissive anon policy for writes.
-- =====================================================================

alter table public.profiles           enable row level security;
alter table public.icebreaker_ideas   enable row level security;
alter table public.custom_templates   enable row level security;
alter table public.game_rooms         enable row level security;

-- ---------- profiles ----------
-- Read your own row, or every row if you are an admin.
-- (select auth.uid()) runs once per statement as an InitPlan. Bare
-- auth.uid() is re-evaluated per row, which matters on the tables that
-- grow. This is the form the Supabase docs use.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id or private.is_admin());

-- Only admins write. This is deliberate: a user must not be able to
-- promote themselves to admin.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());


-- ---------- icebreaker_ideas ----------
-- Anyone (including logged-out visitors) reads published rows. Only
-- admins write. The public catalog on the landing page depends on this,
-- which is why anon is listed here and nowhere else.
drop policy if exists ideas_select on public.icebreaker_ideas;
create policy ideas_select on public.icebreaker_ideas
  for select
  to anon, authenticated
  using (is_published or private.is_admin());

drop policy if exists ideas_insert on public.icebreaker_ideas;
create policy ideas_insert on public.icebreaker_ideas
  for insert
  to authenticated
  with check (private.is_admin());

drop policy if exists ideas_update on public.icebreaker_ideas;
create policy ideas_update on public.icebreaker_ideas
  for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists ideas_delete on public.icebreaker_ideas;
create policy ideas_delete on public.icebreaker_ideas
  for delete
  to authenticated
  using (private.is_admin());


-- ---------- custom_templates ----------
-- Owners manage their own. Admins can see and clean up anyone's.
drop policy if exists templates_select on public.custom_templates;
create policy templates_select on public.custom_templates
  for select
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());

drop policy if exists templates_insert on public.custom_templates;
create policy templates_insert on public.custom_templates
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists templates_update on public.custom_templates;
create policy templates_update on public.custom_templates
  for update
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin())
  with check ((select auth.uid()) = user_id or private.is_admin());

drop policy if exists templates_delete on public.custom_templates;
create policy templates_delete on public.custom_templates
  for delete
  to authenticated
  using ((select auth.uid()) = user_id or private.is_admin());


-- ---------- game_rooms ----------
-- Hosts manage their own rooms. Admins can see and close any room.
drop policy if exists rooms_select on public.game_rooms;
create policy rooms_select on public.game_rooms
  for select
  to authenticated
  using ((select auth.uid()) = host_id or private.is_admin());

-- Participants join from their own phones with no account (PRD 3.1B and the
-- "Quick Start, no auth needed" promise in PRD 3.2), so anon has to be able
-- to resolve a room code. Without this the join flow is impossible: anon sees
-- no rows at all, so no code can ever match.
--
-- Scoped to rooms that have not ended, which makes a finished room
-- indistinguishable from a wrong code. That stops the 4-8 character code
-- space (36^4 = 1.68M at the short end) from being enumerable once a
-- session closes. Kept as its own policy rather than folded into
-- rooms_select because Postgres ORs permissive policies together, so that
-- would hand the anon read to every signed-in user as well.
drop policy if exists rooms_select_anon_active on public.game_rooms;
create policy rooms_select_anon_active on public.game_rooms
  for select
  to anon
  using (status <> 'ended');

-- A row-level policy exposes whole rows, so the policy above would also let
-- anon select host_id, which is the host's auth.users uuid. Column
-- privileges combine with RLS (both must pass), so narrowing the grant to
-- the columns the public lookup renders closes that disclosure without
-- touching the policy. id is excluded: room_code is already unique.
-- authenticated keeps its own table-level grant and is unaffected.
revoke select on public.game_rooms from anon;
grant select (room_code, status, active_game_type, created_at)
  on public.game_rooms to anon;

drop policy if exists rooms_insert on public.game_rooms;
create policy rooms_insert on public.game_rooms
  for insert
  to authenticated
  with check ((select auth.uid()) = host_id or private.is_admin());

drop policy if exists rooms_update on public.game_rooms;
create policy rooms_update on public.game_rooms
  for update
  to authenticated
  using ((select auth.uid()) = host_id or private.is_admin())
  with check ((select auth.uid()) = host_id or private.is_admin());

drop policy if exists rooms_delete on public.game_rooms;
create policy rooms_delete on public.game_rooms
  for delete
  to authenticated
  using ((select auth.uid()) = host_id or private.is_admin());


-- =====================================================================
-- 9. Promote yourself to admin
--
-- Do this LAST, and only AFTER you have signed up through the app
-- (/admin shows a sign-up form). Replace the email, then run:
--
--   update public.profiles
--      set role = 'admin'
--    where email = 'you@example.com';
--
-- Verify it worked:
--
--   select email, role from public.profiles order by created_at;
-- =====================================================================
