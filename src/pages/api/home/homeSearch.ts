import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body);
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const lgdin = await extractBody(req.body);
    console.log("logged in: ", lgdin);
    const getUserIDquery = sqlstring.format(
      "select userID from tableusers where username = ?",
      [lgdin]
    );
    const totalTradesQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss != 'no-entry' AND userID = ?"
    );
    const totalWinsQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss = 'win' AND userID = ?"
    );
    //  get the count of wins and ttl trades
    const bestPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where userID = ? group by currencypair order by count desc limit 1"
    );
    const worstPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where userID = ? group by currencypair order by count asc limit 1"
    );
    // get the count of wins and losses
    // and order by the worst or best
    // then select the worst for loss and the best for win
    const userIDres = await pool.query(getUserIDquery);
    const totalTradesResult = await pool.query(
      sqlstring.format(totalTradesQuery, userIDres.rows[0].userID)
    );
    const totalWinsResult = await pool.query(
      sqlstring.format(totalWinsQuery, userIDres.rows[0].userID)
    );
    const bestPairResult = await pool.query(
      sqlstring.format(bestPairQuery, userIDres.rows[0].userID)
    );
    const worstPairResult = await pool.query(
      sqlstring.format(worstPairQuery, userIDres.rows[0].userID)
    );
    await pool.end();
    console.log("User ID in home search: ", userIDres.rows[0].userID);
    const winPercentage = (totalWins / totalTrades) * 100;
    const tradeData = {
      totalTrades: totalTradesResult.rows[0].count,
      totalWins: totalWinsResult.rows[0].count,
      winPercentage,
      bestPair: bestPairResult.rows[0].currencypair,
      worstPair: worstPairResult.rows[0].currencypair,
    };
    console.log("Trade data:", tradeData);
    res.status(200).json(tradeData);
  } catch (error) {
    res.status(200).json(error);
  }
}
