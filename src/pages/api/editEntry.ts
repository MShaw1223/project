import type { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod, { number } from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  tradeid: number().min(1),
  pairabbr: zod.string().max(5),
});

async function editEntry(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const { tradeid, pairabbr } = schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
          UPDATE tableTrades SET pairabbr = (?) WHERE tradeid = (?);
      `,
    [pairabbr, tradeid]
  );

  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  return new Response(JSON.stringify({ tradeid, pairabbr }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return editEntry(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
