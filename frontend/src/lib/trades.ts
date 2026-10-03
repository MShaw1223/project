import { json, request } from "@/lib/api";

export type TradeOutcome = "win" | "loss" | "breakeven";

export const TRADE_DIRECTIONS = ["long", "short"] as const;
export type TradeDirection = (typeof TRADE_DIRECTIONS)[number];

// the backend derives outcome and r_multiple from direction and prices. Trades logged with the old
// entry form have no direction/exit_price/r_multiple but keep their planned take_profit/risk_ratio
export type Trade = {
  id: string;
  created_at: string;
  account_id: string;
  user_id: string;
  currency_pair: string;
  direction: TradeDirection | "";
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  r_multiple: number | null;
  take_profit: number | null;
  risk_ratio: number | null;
  notes: string;
  outcome: TradeOutcome;
};

export type NewTrade = {
  account_id: string;
  currency_pair: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  stop_loss: number | null;
  notes: string;
};

export type CurrencyPair = {
  id: string;
  created_at: string;
  user_id: string;
  symbol: string;
};

export const tradesQueryKey = (accountId: string) => ["trades", accountId];
export const CURRENCY_PAIRS_QUERY_KEY = ["currency-pairs"];

export async function getTrades(accountId: string): Promise<Trade[]> {
  const { trades } = await request<{ trades: Trade[] }>(`/trades?account_id=${encodeURIComponent(accountId)}`);
  return trades;
}

export async function createTrade(trade: NewTrade): Promise<Trade> {
  const { trade: created } = await request<{ trade: Trade }>("/trades", json("POST", trade));
  return created;
}

export async function deleteTrade(id: string): Promise<void> {
  await request(`/trades/${id}`, { method: "DELETE" });
}

export async function getCurrencyPairs(): Promise<CurrencyPair[]> {
  const { pairs } = await request<{ pairs: CurrencyPair[] }>("/currency-pairs");
  return pairs;
}

export async function createCurrencyPair(symbol: string): Promise<CurrencyPair> {
  const { pair } = await request<{ pair: CurrencyPair }>("/currency-pairs", json("POST", { symbol }));
  return pair;
}
