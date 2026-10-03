import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountSelect } from "@/components/accounts/AccountSelect";
import { CurrencyPairPicker } from "@/components/trades/CurrencyPairPicker";
import { DirectionToggle } from "@/components/trades/DirectionToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, SubmitButton } from "@/components/form/FormField";
import { FormError, FormSuccess } from "@/components/form/FormFeedback";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trade, TradeDirection, createTrade, tradesQueryKey } from "@/lib/trades";
import { LIMITS, newTradeSchema, parseForm } from "@/lib/validation";

// "Trade recorded as a win (+2R)." using the outcome and R multiple the backend derived
function recordedMessage(trade: Trade): string {
  const outcome = trade.outcome === "breakeven" ? "breakeven" : `a ${trade.outcome}`;
  if (trade.r_multiple === null) return `Trade recorded as ${outcome}.`;
  const r = trade.r_multiple > 0 ? `+${trade.r_multiple}` : String(trade.r_multiple);
  return `Trade recorded as ${outcome} (${r}R).`;
}

export const TradeEntryForm = () => {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const [pair, setPair] = useState("");
  const [direction, setDirection] = useState<TradeDirection | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createTrade,
    onSuccess: (trade) => queryClient.invalidateQueries({ queryKey: tradesQueryKey(trade.account_id) }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = parseForm(newTradeSchema, form, { account_id: accountId, currency_pair: pair, direction });
    setFormError(parsed.error ?? null);
    if (!parsed.data) return;
    mutation.mutate(parsed.data, {
      onSuccess: () => {
        form.reset();
        setPair("");
        setDirection("");
      },
    });
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
            <Field label="Entry price" htmlFor="entry_price">
              <Input id="entry_price" name="entry_price" type="number" step="any" min="0" placeholder="Entry price" />
            </Field>
            <Field label="Close price" htmlFor="exit_price">
              <Input id="exit_price" name="exit_price" type="number" step="any" min="0" placeholder="Close price" />
            </Field>
            <Field label="Stop loss (optional)" htmlFor="stop_loss" hint="Needed to calculate the risk ratio">
              <Input id="stop_loss" name="stop_loss" type="number" step="any" min="0" placeholder="Stop loss" />
            </Field>
          </div>
          <Field label="Notes" htmlFor="notes" hint={`Up to ${LIMITS.notesMax} characters`}>
            <Textarea
              id="notes"
              name="notes"
              maxLength={LIMITS.notesMax}
              placeholder="Setup, reasoning, what you'd do differently..."
              className="min-h-[120px]"
            />
          </Field>
          {(formError || mutation.isError) && (
            <FormError message={formError ?? "Failed to submit the trade. Please try again."} />
          )}
          {mutation.isSuccess && mutation.data && <FormSuccess message={recordedMessage(mutation.data)} />}
          <div className="flex justify-end">
            <SubmitButton pending={mutation.isPending}>Submit trade</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
