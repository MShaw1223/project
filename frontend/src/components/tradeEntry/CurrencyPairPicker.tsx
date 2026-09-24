import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  CURRENCY_PAIRS_QUERY_KEY,
  CURRENCY_PAIR_PATTERN,
  createCurrencyPair,
  getCurrencyPairs,
} from "@/lib/trades";

interface CurrencyPairPickerProps {
  value: string;
  onChange: (symbol: string) => void;
  id?: string;
}

// lists the user's saved currency pairs, and lets them add a new one inline
function CurrencyPairPicker({ value, onChange, id }: CurrencyPairPickerProps) {
  const queryClient = useQueryClient();
  const { data: pairs = [], isLoading, isError } = useQuery(CURRENCY_PAIRS_QUERY_KEY, getCurrencyPairs);
  const [adding, setAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const mutation = useMutation(createCurrencyPair, {
    onSuccess: (pair) => {
      queryClient.invalidateQueries(CURRENCY_PAIRS_QUERY_KEY);
      onChange(pair.symbol);
      setAdding(false);
      setNewSymbol("");
    },
  });

  function handleAdd() {
    const symbol = newSymbol.trim().toUpperCase();
    if (!CURRENCY_PAIR_PATTERN.test(symbol)) {
      setAddError("Enter 3-10 letters, e.g. EURUSD");
      return;
    }
    setAddError(null);
    mutation.mutate(symbol);
  }

  if (isError) return <p className="text-sm text-destructive">Failed to load your currency pairs.</p>;

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={isLoading ? "Loading..." : "Currency pair"} />
        </SelectTrigger>
        <SelectContent>
          {pairs.map((pair) => (
            <SelectItem key={pair.id} value={pair.symbol}>
              {pair.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!adding && (
        <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setAdding(true)}>
          <Plus />
          Add new pair
        </Button>
      )}
      {adding && (
        <div className="flex items-center gap-2">
          <Input
            aria-label="New currency pair symbol"
            value={newSymbol}
            onChange={(event) => setNewSymbol(event.target.value)}
            placeholder="EURUSD"
            className="h-9 max-w-[160px]"
          />
          <Button type="button" size="sm" onClick={handleAdd} disabled={mutation.isLoading}>
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setAdding(false);
              setAddError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      {(addError || mutation.isError) && (
        <p role="alert" className="text-sm text-destructive">
          {addError ?? "Failed to add the currency pair."}
        </p>
      )}
    </div>
  );
}

export default CurrencyPairPicker;
