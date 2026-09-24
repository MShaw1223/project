import { BACKEND_PREFIX } from "@/lib/auth";

// mirrors the Go backend's validation for currency_pair (backend/services/trades.go)
export const CURRENCY_PAIR_PATTERN = /^[A-Z]{3,10}$/;
export const TRADE_NOTES_MAX_LENGTH = 1000;

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

// every call authenticates with the httpOnly session cookie the backend set at login
async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${BACKEND_PREFIX}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: undefined }));
    throw new Error(error ?? `request failed: ${response.status}`);
  }
  return response;
}

const jsonBody = (body: unknown): RequestInit => ({
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});

export async function getTrades(accountId: string): Promise<Trade[]> {
  const response = await request(`/trades?account_id=${encodeURIComponent(accountId)}`);
  const { trades } = await response.json();
  return trades as Trade[];
}

export async function createTrade(trade: NewTrade): Promise<Trade> {
  const response = await request("/trades", { method: "POST", ...jsonBody(trade) });
  const { trade: created } = await response.json();
  return created as Trade;
}

export async function deleteTrade(id: string): Promise<void> {
  await request(`/trades/${id}`, { method: "DELETE" });
}

export async function getCurrencyPairs(): Promise<CurrencyPair[]> {
  const response = await request("/currency-pairs");
  const { pairs } = await response.json();
  return pairs as CurrencyPair[];
}

export async function createCurrencyPair(symbol: string): Promise<CurrencyPair> {
  const response = await request("/currency-pairs", { method: "POST", ...jsonBody({ symbol }) });
  const { pair } = await response.json();
  return pair as CurrencyPair;
}

export async function deleteCurrencyPair(id: string): Promise<void> {
  await request(`/currency-pairs/${id}`, { method: "DELETE" });
}
