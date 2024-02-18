import { NextRequest, NextFetchEvent } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newAccountSchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      console.log("body: ", body);
      const { accountname, userid } = newAccountSchema.parse(body);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const SQLstatement = sqlstring.format(
        `
        INSERT INTO tableAccounts (accountname, userid) VALUES (?, ?);
      `,
        [accountname, userid]
      );
      await pool.query(SQLstatement);
      event.waitUntil(pool.end());
      return new Response(JSON.stringify({ accountname, userid }), {
        status: 200,
      });
    } catch (error) {
      console.error("Issue creating account: ", error);
      return new Response("Server error", {
        status: 500,
      });
    }
  } else {
    return new Response("Method not allowed", {
      status: 405,
    });
  }
}
