-- Run this in the Supabase SQL editor (or `supabase db execute -f`) after
-- 0005. Addresses the Supabase security advisor's
-- anon/authenticated_security_definer_function_executable warnings for
-- handle_new_user.
--
-- handle_new_user (0001) and trade_derive_result (0005) are trigger
-- functions: they only ever run as triggers, which doesn't need EXECUTE, so
-- nobody should be able to call them through /rest/v1/rpc. New functions
-- are executable by PUBLIC (and Supabase's default privileges add anon and
-- authenticated), so take that away explicitly. Postgres already refuses to
-- call a trigger function directly; this just stops exposing it at all.
--
-- delete_account (0004) is deliberately left executable by authenticated:
-- that's how a signed-in user deletes their own account, and it only ever
-- acts on auth.uid(). The advisor's warning for it is expected.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.trade_derive_result() from public, anon, authenticated;
