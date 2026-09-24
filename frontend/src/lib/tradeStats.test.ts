import { describe, expect, it } from "vitest";
import {
  computeAccountStats,
  countOutcomes,
  netResultOverTime,
  winRateByPair,
} from "@/lib/tradeStats";
import { Trade } from "@/lib/trades";

const trade = (overrides: Partial<Trade>): Trade => ({
  id: "1",
  created_at: "2024-01-01T00:00:00Z",
  account_id: "acc-1",
  user_id: "user-1",
  currency_pair: "EURUSD",
  direction: "long",
  entry_price: 1,
  exit_price: 1.1,
  stop_loss: null,
  r_multiple: null,
  take_profit: null,
  risk_ratio: null,
  notes: "",
  outcome: "win",
  ...overrides,
});

describe("computeAccountStats", () => {
  it("returns zero trades with no percentage or pairs when there are no trades", () => {
    expect(computeAccountStats([])).toEqual({ totalTrades: 0 });
  });

  it("computes win percentage truncated to 2 decimals", () => {
    const trades = [
      trade({ outcome: "win" }),
      trade({ outcome: "win" }),
      trade({ outcome: "loss" }),
    ];
    const stats = computeAccountStats(trades);
    expect(stats.totalTrades).toBe(3);
    expect(stats.winPercentage).toBeCloseTo(66.66, 2);
  });

  it("picks the pair with the most wins as bestPair and most losses as worstPair", () => {
    const trades = [
      trade({ currency_pair: "EURUSD", outcome: "win" }),
      trade({ currency_pair: "EURUSD", outcome: "win" }),
      trade({ currency_pair: "GBPUSD", outcome: "win" }),
      trade({ currency_pair: "USDJPY", outcome: "loss" }),
      trade({ currency_pair: "USDJPY", outcome: "loss" }),
      trade({ currency_pair: "AUDUSD", outcome: "loss" }),
    ];
    const stats = computeAccountStats(trades);
    expect(stats.bestPair).toBe("EURUSD");
    expect(stats.worstPair).toBe("USDJPY");
  });

  it("leaves bestPair/worstPair undefined when there are no wins/losses", () => {
    const trades = [trade({ outcome: "breakeven" }), trade({ outcome: "breakeven" })];
    const stats = computeAccountStats(trades);
    expect(stats.bestPair).toBeUndefined();
    expect(stats.worstPair).toBeUndefined();
    expect(stats.winPercentage).toBe(0);
  });
});

describe("countOutcomes", () => {
  it("counts every outcome, including ones with no trades", () => {
    const trades = [trade({ outcome: "win" }), trade({ outcome: "win" }), trade({ outcome: "loss" })];
    expect(countOutcomes(trades)).toEqual({ win: 2, loss: 1, breakeven: 0 });
  });
});

describe("netResultOverTime", () => {
  it("returns no points when there are no trades", () => {
    expect(netResultOverTime([])).toEqual([]);
  });

  it("keeps a running wins minus losses total, one point per day, oldest first", () => {
    const trades = [
      trade({ created_at: "2024-01-03T09:00:00Z", outcome: "loss" }),
      trade({ created_at: "2024-01-01T09:00:00Z", outcome: "win" }),
      trade({ created_at: "2024-01-01T17:00:00Z", outcome: "win" }),
      trade({ created_at: "2024-01-02T09:00:00Z", outcome: "breakeven" }),
    ];
    expect(netResultOverTime(trades)).toEqual([
      { date: "2024-01-01", net: 2 },
      { date: "2024-01-02", net: 2 },
      { date: "2024-01-03", net: 1 },
    ]);
  });
});

describe("winRateByPair", () => {
  it("returns each pair's rounded win rate, highest first", () => {
    const trades = [
      trade({ currency_pair: "EURUSD", outcome: "win" }),
      trade({ currency_pair: "EURUSD", outcome: "loss" }),
      trade({ currency_pair: "EURUSD", outcome: "loss" }),
      trade({ currency_pair: "GBPUSD", outcome: "win" }),
    ];
    expect(winRateByPair(trades)).toEqual([
      { pair: "GBPUSD", trades: 1, winRate: 100 },
      { pair: "EURUSD", trades: 3, winRate: 33 },
    ]);
  });

  it("breaks win rate ties by trade count, then pair name", () => {
    const trades = [
      trade({ currency_pair: "USDJPY", outcome: "win" }),
      trade({ currency_pair: "AUDUSD", outcome: "win" }),
      trade({ currency_pair: "EURUSD", outcome: "win" }),
      trade({ currency_pair: "EURUSD", outcome: "win" }),
    ];
    expect(winRateByPair(trades).map((row) => row.pair)).toEqual(["EURUSD", "AUDUSD", "USDJPY"]);
  });
});
