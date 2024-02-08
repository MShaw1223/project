import { NextRequest, NextFetchEvent } from "next/server";
import { Pool } from "@neondatabase/serverless";
import zod from "zod";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newAccountSchema } from "@/utils/schema";

export const config = {
  runtime: "edge",
};

async function createNewAccount(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);

  const accountname = newAccountSchema.parse(body);

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
  - Hardcoded userid for now
  - need to change it so there is no way of accessing
    - could do index and then it renders a new logged in index of the homepage? 
      or renders /loggedin/home
    - could have logged in as a variable that is set by userid 
    - could have just @/loggedin/... as a placeholder
        e.g. /millershaw/home
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
