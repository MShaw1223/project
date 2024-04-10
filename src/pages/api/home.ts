import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  function returnTruncated(value: number): number {
    var placeholder = Math.trunc(value * 100) / 100;
    return placeholder;
  }
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const lgdin: string = req.body;
    const getUserIDquery = sqlstring.format(
      "select userid from tableusers where username = ?",
      [lgdin]
    );
    const responseUserid = await pool.query(getUserIDquery);
    const userid = responseUserid.rows[0].userid;
    const getAccIDquery = sqlstring.format(
      "select accountid from tableaccounts where userid = ?",
      [userid]
    );
    const responseAccountid = await pool.query(getAccIDquery);
    const accountid = responseAccountid.rows[0].accountid;
    const totalTradesQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss != 'no-entry' AND accountid = ?",
      [accountid]
    );
    const totalWinsQuery = sqlstring.format(
      "select count(*) from tableTrades where winLoss = 'win' AND accountid = ?",
      [accountid]
    );
    //  get the count of wins and ttl trades
    const bestPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where accountid = ? AND winloss = 'win' group by currencypair",
      [accountid]
    );
    const worstPairQuery = sqlstring.format(
      "select currencypair, count(*) as count from tabletrades where accountid = ? AND winloss = 'loss' group by currencypair",
      [accountid]
    );
    // get the count of wins and losses
    // and order by the worst or best
    // then select the worst for loss and the best for win
    const totalTradesResult = await pool.query(totalTradesQuery);
    const totalWinsResult = await pool.query(totalWinsQuery);
    const bestPairResult = await pool.query(bestPairQuery);
    const worstPairResult = await pool.query(worstPairQuery);
    await pool.end();
    const tradeData = {
      totalTrades: totalTradesResult.rows[0].count,
      totalWins: totalWinsResult.rows[0].count,
      winPercentage: returnTruncated(
        (totalWinsResult.rows[0].count / totalTradesResult.rows[0].count) * 100
      ),
      bestPair: bestPairResult.rows[0].currencypair,
      worstPair: worstPairResult.rows[0].currencypair,
    };
    res.status(200).json(tradeData);
  } catch (error) {
    res.status(200).json(error);
  }
}
