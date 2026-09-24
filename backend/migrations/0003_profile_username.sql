-- Run this in the Supabase SQL editor (or `supabase db execute -f`) after
-- 0002. Additive: adds an optional, user-chosen username to each profile.
--
-- Usernames are 3-20 letters, digits or underscores (mirrored by the
-- backend's services.usernamePattern) and unique case-insensitively, so
-- "Trader_1" and "trader_1" can't both exist. The existing
-- profile_update_own policy already lets a user update their own row.

alter table public.profile
  add column if not exists username text
    check (username ~ '^[A-Za-z0-9_]{3,20}$');

create unique index if not exists profile_username_lower_idx
  on public.profile (lower(username));
