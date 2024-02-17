import { NextRequest, NextFetchEvent } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newAccountSchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

async function createNewAccount(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const data = newAccountSchema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
      INSERT INTO tableAccount (accountname, userid) VALUES (?, ?);
    `,
    [data.accountname, data.userid]
  );

  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  return new Response(JSON.stringify({ data }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return createNewAccount(req, event);
  }
  return new Response("Method not allowed", {
    status: 405,
  });
}
