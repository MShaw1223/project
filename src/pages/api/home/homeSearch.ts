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
      "select from tableusers where username = ?",
      [lgdin]
    );
    const userid = await pool.query(getUserIDquery);
    const getAccIDquery = sqlstring.format(
      "select from tableaccounts where userid = ?",
      [userid]
    );
    const accountid = await pool.query(getAccIDquery);
    const totalTradesQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss != 'no-entry' AND accountid = ?",
      [accountid]
    );
    const totalWinsQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss = 'win' AND acccountid = ?",
      [accountid]
    );
    //  get the count of wins and ttl trades
    const bestPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where accountid = ? group by currencypair order by count desc limit 1",
      [accountid]
    );
    const worstPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where accountid = ? group by currencypair order by count asc limit 1",
      [accountid]
    );
    // get the count of wins and losses
    // and order by the worst or best
    // then select the worst for loss and the best for win
    const totalTradesResult = await pool.query(
      sqlstring.format(totalTradesQuery)
    );
    const totalWinsResult = await pool.query(totalWinsQuery);
    const bestPairResult = await pool.query(bestPairQuery);
    const worstPairResult = await pool.query(worstPairQuery);
    await pool.end();
    console.log("User ID in home search: ", userid.rows[0].userID);
    const tradeData = {
      totalTrades: totalTradesResult.rows[0].count,
      totalWins: totalWinsResult.rows[0].count,
      winPercentage:
        (totalWinsResult.rows[0].count / totalTradesResult.rows[0].count) * 100,
      bestPair: bestPairResult.rows[0].currencypair,
      worstPair: worstPairResult.rows[0].currencypair,
    };
    console.log("Trade data:", tradeData);
    res.status(200).json(tradeData);
  } catch (error) {
    res.status(200).json(error);
  }
}
