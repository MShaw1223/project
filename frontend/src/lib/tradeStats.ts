import { Trade } from "@/lib/trades";

export type AccountStats = {
  totalTrades: number;
  winPercentage?: number;
  bestPair?: string;
  worstPair?: string;
};

// the pair with the most trades of the given outcome, ties broken by first occurrence
function topPairByOutcome(trades: Trade[], outcome: Trade["outcome"]): string | undefined {
  const counts = new Map<string, number>();
  for (const trade of trades) {
    if (trade.outcome !== outcome) continue;
    counts.set(trade.currency_pair, (counts.get(trade.currency_pair) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [pair, count] of counts) {
    if (count > bestCount) {
      best = pair;
      bestCount = count;
    }
  }
  return best;
}

// mirrors the legacy home.ts stats: win percentage truncated to 2 decimals, best/worst pair by
// win/loss count
export function computeAccountStats(trades: Trade[]): AccountStats {
  if (trades.length === 0) return { totalTrades: 0 };

  const wins = trades.filter((trade) => trade.outcome === "win").length;
  const winPercentage = Math.trunc((wins / trades.length) * 100 * 100) / 100;

  return {
    totalTrades: trades.length,
    winPercentage,
    bestPair: topPairByOutcome(trades, "win"),
    worstPair: topPairByOutcome(trades, "loss"),
  };
}

export type OutcomeCounts = Record<Trade["outcome"], number>;

export function countOutcomes(trades: Trade[]): OutcomeCounts {
  const counts: OutcomeCounts = { win: 0, loss: 0, breakeven: 0 };
  for (const trade of trades) counts[trade.outcome] += 1;
  return counts;
}

export type NetResultPoint = {
  date: string;
  net: number;
};

// running wins minus losses per calendar day (UTC), oldest first, breakevens don't move the line
export function netResultOverTime(trades: Trade[]): NetResultPoint[] {
  const sorted = [...trades].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const points: NetResultPoint[] = [];
  let net = 0;
  for (const trade of sorted) {
    if (trade.outcome === "win") net += 1;
    else if (trade.outcome === "loss") net -= 1;
    const date = trade.created_at.slice(0, 10);
    const last = points[points.length - 1];
    if (last?.date === date) last.net = net;
    else points.push({ date, net });
  }
  return points;
}

export type PairWinRate = {
  pair: string;
  trades: number;
  winRate: number;
};

// win rate per currency pair, highest first, ties broken by trade count then pair name
export function winRateByPair(trades: Trade[]): PairWinRate[] {
  const byPair = new Map<string, { trades: number; wins: number }>();
  for (const trade of trades) {
    const entry = byPair.get(trade.currency_pair) ?? { trades: 0, wins: 0 };
    entry.trades += 1;
    if (trade.outcome === "win") entry.wins += 1;
    byPair.set(trade.currency_pair, entry);
  }
  return Array.from(byPair, ([pair, { trades, wins }]) => ({
    pair,
    trades,
    winRate: Math.round((wins / trades) * 100),
  })).sort((a, b) => b.winRate - a.winRate || b.trades - a.trades || a.pair.localeCompare(b.pair));
}
