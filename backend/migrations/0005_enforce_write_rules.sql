-- Run this in the Supabase SQL editor (or `supabase db execute -f`) after
-- 0004. It makes the database enforce the same rules as the backend for
-- trade, brokerage_account and currency_pair writes.
--
-- Why: the backend talks to Supabase with the user's own token, so anything
-- it can write, the user can also write directly through Supabase's REST
-- API, skipping the backend's validation (eg a trade marked "win" with losing
-- prices, or a backdated created_at). Enforcing the rules here means a direct
-- write gets exactly the same checks as one through the backend.
--
-- New constraints are NOT VALID: they apply to every new or changed row but
-- leave trades logged with the old entry form (no direction/exit price) as
-- they are.

-- ── trade ───────────────────────────────────────────────────────────────
-- Users may only supply the trade's inputs. id, created_at, outcome and
-- r_multiple come from the database; take_profit/risk_ratio are legacy.
-- Trades are never updated (there's no update policy), only inserted and
-- deleted, so delete stays as it was.
revoke insert, update on public.trade from anon, authenticated;
grant insert (user_id, account_id, currency_pair, direction, entry_price, exit_price, stop_loss, notes)
  on public.trade to authenticated;

alter table public.trade
  add constraint trade_inputs_required
    check (direction is not null and exit_price is not null) not valid,
  add constraint trade_currency_pair_format
    check (currency_pair ~ '^[A-Z]{3,10}$') not valid,
  add constraint trade_prices_positive
    check (entry_price > 0 and (stop_loss is null or stop_loss > 0)) not valid,
  -- the stop has to sit on the losing side of the entry, or there's no risk to measure against
  add constraint trade_stop_on_losing_side
    check (stop_loss is null
           or (direction = 'long' and stop_loss < entry_price)
           or (direction = 'short' and stop_loss > entry_price)) not valid,
  add constraint trade_notes_length
    check (char_length(notes) <= 1000) not valid;

-- Derives the outcome from direction and prices, and the realised R multiple
-- (profit / distance to the stop, 2 decimals) when there's a stop. Runs on
-- every insert, so these can't be supplied or faked by the client. This is
-- the only place the result is calculated.
create or replace function public.trade_derive_result()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  sign numeric := case when new.direction = 'short' then -1 else 1 end;
  move numeric := sign * (new.exit_price - new.entry_price);
begin
  new.outcome := case
    when move > 0 then 'win'
    when move < 0 then 'loss'
    else 'breakeven'
  end;
  -- a stop at the entry would divide by zero; trade_stop_on_losing_side rejects that row anyway
  new.r_multiple := case
    when new.stop_loss is null or new.stop_loss = new.entry_price then null
    else round(move / (sign * (new.entry_price - new.stop_loss)), 2)
  end;
  return new;
end;
$$;

drop trigger if exists trade_derive_result on public.trade;
create trigger trade_derive_result
  before insert on public.trade
  for each row execute function public.trade_derive_result();

-- ── brokerage_account ───────────────────────────────────────────────────
-- Users may create an account with a name and rename it, nothing else.
-- The existing check already limits the name to 1-15 characters; this adds
-- the backend's "no leading/trailing whitespace" rule.
revoke insert, update on public.brokerage_account from anon, authenticated;
grant insert (user_id, name), update (name) on public.brokerage_account to authenticated;

alter table public.brokerage_account
  add constraint brokerage_account_name_trimmed
    check (name ~ '^\S(.*\S)?$') not valid;

-- ── currency_pair ───────────────────────────────────────────────────────
-- Same gap: the symbol format was only checked by the backend.
revoke insert, update on public.currency_pair from anon, authenticated;
grant insert (user_id, symbol) on public.currency_pair to authenticated;

alter table public.currency_pair
  add constraint currency_pair_symbol_format
    check (symbol ~ '^[A-Z]{3,10}$') not valid;
