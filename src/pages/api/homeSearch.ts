import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const totalTradesQuery = sqlstring.format(
  "select count(*) from tableTrades where winLoss != 'no-entry'"
);
const totalWinsQuery = sqlstring.format(
  "select count(*) from tableTrades where winLoss = 'win'"
);
const bestPairQuery = sqlstring.format(
  "select currencypair, count(*) as count from tabletrades group by currencypair order by count desc limit 1"
);
const worstPairQuery = sqlstring.format(
  "select currencypair, count(*) as count from tabletrades group by currencypair order by count asc limit 1"
);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const totalTradesResult = await pool.query(totalTradesQuery);
    const totalWinsResult = await pool.query(totalWinsQuery);
    const bestPairResult = await pool.query(bestPairQuery);
    const worstPairResult = await pool.query(worstPairQuery);

    const totalTrades = totalTradesResult.rows[0].count;
    const totalWins = totalWinsResult.rows[0].count;
    const bestPair = bestPairResult.rows[0].currencypair;
    const worstPair = worstPairResult.rows[0].currencypair;
    const winPercentage = (totalWins / totalTrades) * 100;
    const tradeData = {
      totalTrades,
      totalWins,
      winPercentage,
      bestPair,
      worstPair,
    };
    console.log("Trade data:", tradeData);
    res.status(200).json(tradeData);
  } catch {
    const totalTrades = 0;
    const totalWins = 0;
    const bestPair = 0;
    const worstPair = 0;
    const winPercentage = 0;
    const empty = {
      totalTrades,
      totalWins,
      winPercentage,
      bestPair,
      worstPair,
    };
    res.status(200).json(empty);
  }
}
