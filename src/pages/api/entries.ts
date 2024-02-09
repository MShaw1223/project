// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { entries_schema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

async function makeEntryHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const {
    accountID,
    selectedPair: currencyPair,
    entryPrice,
    riskRatio,
    stopLoss,
    takeProfit,
    tradeNotes,
    userID,
    selectedOutcome: winLoss,
  } = entries_schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
        INSERT INTO tableTrades (accountid, currencypair, entryprice, riskratio, stoploss, takeprofit, tradenotes, userid, winloss)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      accountID,
      currencyPair,
      entryPrice,
      riskRatio,
      stopLoss,
      takeProfit,
      tradeNotes,
      userID,
      winLoss,
    ]
  );
  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  const responsePayload = {
    entryPrice,
    stopLoss,
    takeProfit,
    tradeNotes,
    riskRatio,
    winLoss,
    currencyPair,
    userID,
    accountID,
  };
  return new Response(JSON.stringify({ responsePayload }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return makeEntryHandler(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
