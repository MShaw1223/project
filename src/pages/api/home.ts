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
    const getAccIDquery = sqlstring.format(
      "select accountid from tableaccounts where userid = (select userid from tableusers where authkey = ?)",
      [lgdin]
    );
    const responseAccountid = await pool.query(getAccIDquery);
    const accountids = responseAccountid.rows.map((row) => row.accountid);

    const tradeData = [];

    for (let i = 0; i < accountids.length; i++) {
      const accountid = accountids[i];
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
      const [
        totalTradesResult,
        totalWinsResult,
        bestPairResult,
        worstPairResult,
      ] = await Promise.all([
        pool.query(totalTradesQuery),
        pool.query(totalWinsQuery),
        pool.query(bestPairQuery),
        pool.query(worstPairQuery),
      ]);
      const payload = {
        accountid: accountid,
        totalTrades: totalTradesResult.rows[0].count as number,
        totalWins: totalWinsResult.rows[0].count as number,
        winPercentage: returnTruncated(
          (totalWinsResult.rows[0].count / totalTradesResult.rows[0].count) *
            100
        ),
        bestPair: bestPairResult.rows[0]?.currencypair as string,
        worstPair: worstPairResult.rows[0]?.currencypair as string,
      };
      tradeData.push(payload);
    }
    await pool.end();
    res.status(200).json(tradeData);
  } catch (error) {
    res.status(500).json(error);
  }
}
