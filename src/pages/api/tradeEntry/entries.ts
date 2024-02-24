// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { entries_schema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      const {
        accountID,
        selectedPair: currencyPair,
        entryPrice,
        riskRatio,
        stopLoss,
        takeProfit,
        tradeNotes,
        selectedOutcome: winLoss,
      } = entries_schema.parse(body);
      console.log("body: ", body);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const SQLstatement = sqlstring.format(
        `
            INSERT INTO tableTrades (accountid, currencypair, entryprice, riskratio, stoploss, takeprofit, tradenotes, winloss)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          accountID,
          currencyPair,
          entryPrice,
          riskRatio,
          stopLoss,
          takeProfit,
          tradeNotes,
          winLoss,
        ]
      );
      await pool.query(SQLstatement);
      event.waitUntil(pool.end());
      console.log("SQLstatement: ", SQLstatement);
      const responsePayload = {
        entryPrice,
        stopLoss,
        takeProfit,
        tradeNotes,
        riskRatio,
        winLoss,
        currencyPair,
        accountID,
      };
      return new Response(JSON.stringify({ responsePayload }), {
        status: 200,
      });
    } catch (error) {
      return new Response("Unable to enter trade", {
        status: 400,
      });
    }
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
