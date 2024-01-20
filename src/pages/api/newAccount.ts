import { NextRequest, NextFetchEvent } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  accountname: zod.string(),
});

async function createNewAccount(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const accountname = schema.parse(body);

  console.log("body", body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
      INSERT INTO tableAccount (accountname, userid) VALUES (?, ?);
    `,
    [accountname.accountname, 1]
  );

  /*
  Hardcoded userid for now
   */
  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  return new Response(JSON.stringify({ accountname }), {
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
