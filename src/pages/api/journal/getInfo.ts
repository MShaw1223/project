import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
//retrieval(variable){
// etc etc
//  }
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// where tradesid = ${loggedIn} AND

export default async function retreival(selectedAccount: any) {
  try {
    const getTradesInfo = sqlstring.format(
      `
        from tableTrades select (tradesid, entryprice,	stoploss,	takeprofit,	tradenotes,	riskratio,	winloss)
        where accountID = (?)
        `,
      selectedAccount
    );

    return getTradesInfo;
  } catch (error) {
    return new Response("Issue in retrieval", {
      status: 405,
    });
  }
}

// db query would return stuff under:
// tradesid	accountid	userid
