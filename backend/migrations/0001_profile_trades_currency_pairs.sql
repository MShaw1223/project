-- Run this in the Supabase SQL editor (or `supabase db execute -f`) against
-- the project referenced by SUPABASE_URL. This script is safe to re-run: it
-- drops and recreates everything it owns (brokerage_account, profile,
-- currency_pair, trade) in dependency order, so a failed partial apply just
-- gets cleaned up and reapplied on the next run.
--
-- WARNING: the drops are destructive. This is fine while these tables are
-- still empty / in early development, but once there's real data you want to
-- keep, stop re-running this file wholesale and write an additive migration
-- instead.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.trade cascade;
drop table if exists public.currency_pair cascade;
drop table if exists public.profile cascade;
drop table if exists public.brokerage_account cascade;

-- ── brokerage_account ──────────────────────────────────────────────────
-- A user's tradeable brokerage account (create/rename/delete already wired
-- up end-to-end in backend/{models,repositories,services,handlers}/brokerage_accounts.go
-- and frontend's account-management page). Recreated here because it was
-- previously created by hand and is now gone from the project.
create table public.brokerage_account (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 15)
);

alter table public.brokerage_account enable row level security;

create policy "brokerage_account_select_own" on public.brokerage_account
  for select using (auth.uid() = user_id);
create policy "brokerage_account_insert_own" on public.brokerage_account
  for insert with check (auth.uid() = user_id);
create policy "brokerage_account_update_own" on public.brokerage_account
  for update using (auth.uid() = user_id);
create policy "brokerage_account_delete_own" on public.brokerage_account
  for delete using (auth.uid() = user_id);

-- ── profile ─────────────────────────────────────────────────────────────
-- One row per auth user, created automatically on signup. `active = false`
-- is a soft-delete: the row (and the auth user) are kept, but login is
-- refused and the user's owned data has been cascade-deleted (see the
-- backend's ProfileService.DeactivateAccount).
create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profile enable row level security;

create policy "profile_select_own" on public.profile
  for select using (auth.uid() = id);

create policy "profile_update_own" on public.profile
  for update using (auth.uid() = id);

-- Auto-create the profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profile (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profile rows for any users who signed up before this migration.
insert into public.profile (id)
select id from auth.users
on conflict (id) do nothing;

-- ── currency_pair ───────────────────────────────────────────────────────
-- A per-user list of tradable symbols (eg "EURUSD") that populates the pair
-- picker on the Trade Entry page.
create table public.currency_pair (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  unique (user_id, symbol)
);

alter table public.currency_pair enable row level security;

create policy "currency_pair_select_own" on public.currency_pair
  for select using (auth.uid() = user_id);
create policy "currency_pair_insert_own" on public.currency_pair
  for insert with check (auth.uid() = user_id);
create policy "currency_pair_delete_own" on public.currency_pair
  for delete using (auth.uid() = user_id);

-- ── trade ───────────────────────────────────────────────────────────────
-- A trade journal entry against one of the user's brokerage accounts.
-- Deleting the brokerage account (directly, or via profile deactivation)
-- cascades to delete its trades.
create table public.trade (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.brokerage_account (id) on delete cascade,
  currency_pair text not null,
  entry_price numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  risk_ratio numeric not null,
  notes text not null default '',
  outcome text not null check (outcome in ('win', 'loss', 'breakeven'))
);

create index trade_account_id_idx on public.trade (account_id);

alter table public.trade enable row level security;

create policy "trade_select_own" on public.trade
  for select using (auth.uid() = user_id);
-- also requires account_id to actually belong to the caller, so a user can't
-- attach a trade to someone else's brokerage account by guessing its id
create policy "trade_insert_own" on public.trade
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.brokerage_account a
      where a.id = account_id and a.user_id = auth.uid()
    )
  );
create policy "trade_delete_own" on public.trade
  for delete using (auth.uid() = user_id);
