-- Run this in the Supabase SQL editor (or `supabase db execute -f`) after
-- 0003. It replaces the soft-delete (profile.active) with a real delete and
-- stops users writing columns they shouldn't through Supabase's REST API.
--
-- Why: the profile_update_own policy let a user update *every* column of
-- their own profile row, so a deactivated user could sign in to Supabase
-- directly and set active back to true, and `active` was only checked when
-- the backend issued a login cookie, not on normal requests.
--
-- WARNING: step 1 permanently deletes accounts that were deactivated under
-- the old soft-delete, along with all of their data. Those users asked for
-- their account to be deleted; this finishes the job.

-- ── 1. finish deleting soft-deleted accounts, then drop the flag ─────────
-- deleting the auth user cascades to profile, brokerage_account, trade and
-- currency_pair (all reference auth.users on delete cascade)
delete from auth.users
where id in (select id from public.profile where active = false);

alter table public.profile drop column if exists active;

-- ── 2. users may only change their own username directly ────────────────
-- the row-level policy (profile_update_own) still limits updates to the
-- caller's own row; this limits which columns, so id/created_at can't be
-- rewritten through the REST API
revoke update on public.profile from anon, authenticated;
grant update (username) on public.profile to authenticated;

-- ── 3. self-service account deletion ────────────────────────────────────
-- Runs with the owner's rights so it can delete from auth.users, but only
-- ever deletes the caller: auth.uid() comes from their verified JWT. One
-- statement, so the account and all its data go together or not at all.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
