import type { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newCurrencySchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

async function enterNewCurrency(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const pairabbr = newCurrencySchema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
        INSERT INTO tablePairs (pairabbr) VALUES (?);
    `,
    [pairabbr.pairabbr]
  );

  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  return new Response(JSON.stringify({ pairabbr }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return enterNewCurrency(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
