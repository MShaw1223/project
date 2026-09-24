import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import AccountSelect from "@/components/AccountSelect";
import CurrencyPairPicker from "@/components/tradeEntry/CurrencyPairPicker";
import DirectionToggle from "@/components/tradeEntry/DirectionToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/FormField";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CURRENCY_PAIR_PATTERN,
  TRADE_NOTES_MAX_LENGTH,
  Trade,
  TradeDirection,
  createTrade,
  tradesQueryKey,
} from "@/lib/trades";

function parsePositiveNumber(data: FormData, field: string): number | null {
  const raw = data.get(field);
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

// "Trade recorded as a win (+2R)." using the outcome and R multiple the backend derived
function recordedMessage(trade: Trade): string {
  const outcome = trade.outcome === "breakeven" ? "breakeven" : `a ${trade.outcome}`;
  if (trade.r_multiple === null) return `Trade recorded as ${outcome}.`;
  const r = trade.r_multiple > 0 ? `+${trade.r_multiple}` : String(trade.r_multiple);
  return `Trade recorded as ${outcome} (${r}R).`;
}

const TradeEntryForm = () => {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const [pair, setPair] = useState("");
  const [direction, setDirection] = useState<TradeDirection | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation(createTrade, {
    onSuccess: (trade) => queryClient.invalidateQueries(tradesQueryKey(trade.account_id)),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (accountId === "") {
      setFormError("Select the account for this trade");
      return;
    }
    if (!CURRENCY_PAIR_PATTERN.test(pair)) {
      setFormError("Select or add a currency pair");
      return;
    }
    if (direction === "") {
      setFormError("Choose whether the trade was long or short");
      return;
    }
    const entryPrice = parsePositiveNumber(data, "entryPrice");
    const exitPrice = parsePositiveNumber(data, "exitPrice");
    if (entryPrice === null || exitPrice === null) {
      setFormError("Entry and close price must both be greater than 0");
      return;
    }
    const rawStop = data.get("stopLoss");
    const hasStop = typeof rawStop === "string" && rawStop.trim() !== "";
    const stopLoss = hasStop ? parsePositiveNumber(data, "stopLoss") : null;
    if (hasStop && stopLoss === null) {
      setFormError("Stop loss must be greater than 0, or left empty");
      return;
    }
    if (stopLoss !== null && (direction === "long" ? stopLoss >= entryPrice : stopLoss <= entryPrice)) {
      setFormError(
        direction === "long"
          ? "For a long trade the stop loss must be below the entry price"
          : "For a short trade the stop loss must be above the entry price"
      );
      return;
    }
    const notes = data.get("notes");
    if (typeof notes === "string" && notes.length > TRADE_NOTES_MAX_LENGTH) {
      setFormError(`Notes must be at most ${TRADE_NOTES_MAX_LENGTH} characters`);
      return;
    }

    setFormError(null);
    mutation.mutate(
      {
        account_id: accountId,
        currency_pair: pair,
        direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        stop_loss: stopLoss,
        notes: typeof notes === "string" ? notes : "",
      },
      {
        onSuccess: () => {
          form.reset();
          setPair("");
          setDirection("");
        },
      }
    );
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>New trade</CardTitle>
        <CardDescription>
          Win or loss is worked out from the direction and prices, and the risk ratio (R) from the stop loss when you
          give one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account" htmlFor="account">
              <AccountSelect id="account" value={accountId} onChange={setAccountId} />
            </Field>
            <Field label="Currency pair" htmlFor="currencyPair">
              <CurrencyPairPicker id="currencyPair" value={pair} onChange={setPair} />
            </Field>
            <Field label="Direction" className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
              <DirectionToggle id="direction" value={direction} onChange={setDirection} />
            </Field>
            <Field label="Entry price" htmlFor="entryPrice">
              <Input id="entryPrice" name="entryPrice" type="number" step="any" min="0" placeholder="Entry price" />
            </Field>
            <Field label="Close price" htmlFor="exitPrice">
              <Input id="exitPrice" name="exitPrice" type="number" step="any" min="0" placeholder="Close price" />
            </Field>
            <Field label="Stop loss (optional)" htmlFor="stopLoss" hint="Needed to calculate the risk ratio">
              <Input id="stopLoss" name="stopLoss" type="number" step="any" min="0" placeholder="Stop loss" />
            </Field>
          </div>
          <Field label="Notes" htmlFor="notes" hint={`Up to ${TRADE_NOTES_MAX_LENGTH} characters`}>
            <Textarea
              id="notes"
              name="notes"
              maxLength={TRADE_NOTES_MAX_LENGTH}
              placeholder="Setup, reasoning, what you'd do differently..."
              className="min-h-[120px]"
            />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to submit the trade. Please try again."} />
          )}
          {mutation.isSuccess && mutation.data && <FormSuccess message={recordedMessage(mutation.data)} />}
          <div className="flex justify-end">
            <SubmitButton pending={mutation.isLoading}>Submit trade</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeEntryForm;
