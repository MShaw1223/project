import type { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod, { string } from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  pairAbbr: zod.string().max(5),
});

async function enterNewCurrency(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const pairAbbr = schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
        INSERT INTO tablePairs (pairAbbr) VALUES (?);
    `,
    [pairAbbr]
  );

  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  const responsePayload = { pairAbbr };

  return new Response(JSON.stringify({ responsePayload }), {
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
