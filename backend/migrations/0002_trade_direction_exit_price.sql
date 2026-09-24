-- Run this in the Supabase SQL editor (or `supabase db execute -f`) after
-- 0001. It is additive and keeps existing trades: the entry form now records
-- direction + entry/exit prices (and an optional stop loss) and the backend
-- derives the outcome and the realised R multiple from them.
--
-- Trades logged before this migration keep their take_profit/risk_ratio and
-- have no direction, exit_price or r_multiple, so the new columns stay
-- nullable and the old planned-target columns become optional.

alter table public.trade
  add column if not exists direction text check (direction in ('long', 'short')),
  add column if not exists exit_price numeric check (exit_price > 0),
  add column if not exists r_multiple numeric;

alter table public.trade
  alter column stop_loss drop not null,
  alter column take_profit drop not null,
  alter column risk_ratio drop not null;
