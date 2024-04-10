// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { entries_schema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
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
      await pool.end();
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
      return NextResponse.json(
        { responsePayload },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json("Unable to enter trade", {
        status: 400,
      });
    }
  }
  return NextResponse.json("Invalid Method", {
    status: 405,
  });
}
