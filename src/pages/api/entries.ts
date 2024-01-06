// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

//this page for main db table?

import type { NextFetchEvent, NextRequest } from "next/server";
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
  selectedAccount: zod.string(),
  tradeNotes: zod.string().max(250),
  currencyPair: zod.string(),
  riskRatio: number().max(9999.999).min(2.0),
});

async function createPageHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const {
    entryPrice,
    stopLoss,
    takeProfit,
    selectedAccount,
    tradeNotes,
    currencyPair,
    riskRatio,
  } = schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  let tradesTable, accountTable;

  switch (selectedAccount) {
    case "accountNumberOne":
      tradesTable = "tradesaccounta";
      accountTable = "accounta";
      break;
    case "accountNumberTwo":
      tradesTable = "tradesaccountb";
      accountTable = "accountb";
      break;
    case "accountNumberThree":
      tradesTable = "tradesaccountc";
      accountTable = "accountc";
      break;
    // Add more cases for additional accounts if needed

    default:
      throw new Error("Invalid selected account");
  }

  let Pair;

  switch (currencyPair) {
    case "EURGBP":
      Pair = "EUR/GBP";
      break;
    case "GBPUSD":
      Pair = "GBP/USD";
      break;
    case "XAUUSD":
      Pair = "XAU/USD";
      break;

    default:
      throw new Error("Invalid Pair Selected");
  }

  const SQLstatement = sqlstring.format(
    `
      WITH X AS(
        INSERT INTO ${tradesTable} (details)
        VALUES (ROW(?, ?, ?, ? ,?, ?))
        RETURNING tradeId${accountTable.toLowerCase()}
      )
      INSERT INTO ${accountTable} (tradeId${accountTable.toLowerCase()})
      SELECT tradeId${accountTable.toLowerCase()} FROM X;
      `,
    [entryPrice, stopLoss, takeProfit, tradeNotes, Pair, riskRatio]
  );

  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  const responsePayload = {
    entryPrice,
    stopLoss,
    takeProfit,
    tradeNotes,
    Pair,
    riskRatio,
  };

  return new Response(JSON.stringify({ responsePayload }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return createPageHandler(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
