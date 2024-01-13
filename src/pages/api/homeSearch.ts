import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Execute SQL queries to get the trade data
  const totalTrades = await pool.query("SELECT COUNT(*) FROM tableTrades");
  const totalWins = await pool.query(
    "SELECT COUNT(*) FROM tableTrades WHERE winLoss = 'win'"
  );
  const bestPair = await pool.query(
    "SELECT currencyPair, COUNT(*) as count FROM tableTrades GROUP BY currencyPair ORDER BY count DESC LIMIT 1"
  );
  const worstPair = await pool.query(
    "SELECT currencyPair, COUNT(*) as count FROM tableTrades GROUP BY currencyPair ORDER BY count ASC LIMIT 1"
  );

  const tradeData = {
    totalTrades: totalTrades.rows[0].count,
    totalWins: totalWins.rows[0].count,
    winPercentage: (totalWins.rows[0].count / totalTrades.rows[0].count) * 100,
    bestPair: bestPair.rows[0].currencyPair,
    worstPair: worstPair.rows[0].currencyPair,
  };

  res.status(200).json(tradeData);
}
