// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

//this page for main db table?

import { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod, { number } from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};
const schema = zod.object({
  entryPrice: number().max(9999999.9999999).min(0.0000001),
  stopLoss: number().max(9999999.9999999).min(0.0000001),
  takeProfit: number().max(9999999.9999999).min(0.0000001),
  selectedAccount: number().min(0),
  tradeNotes: zod.string().max(1250),
  selectedPair: zod.string(),
  riskRatio: number().max(9999.999).min(2.0),
  selectedOutcome: zod.string(),
  userID: zod.number(),
  accountID: zod.number(),
});

async function makeEntryHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const {
    entryPrice,
    stopLoss,
    takeProfit,
    selectedAccount: selectedAccountValue,
    tradeNotes,
    selectedPair: currencyPair,
    riskRatio,
    selectedOutcome: winOrLoss,
    userID,
    accountID,
  } = schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
        INSERT INTO tableTrades
        VALUES ROW(?, ?, ?, ? ,?, ?, ?,?,?)
    `,
    [
      entryPrice,
      stopLoss,
      takeProfit,
      tradeNotes,
      riskRatio,
      winOrLoss,
      currencyPair,
      userID,
      selectedAccountValue,
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
    winOrLoss,
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
