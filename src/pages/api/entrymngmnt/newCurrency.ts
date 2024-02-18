import type { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newCurrencySchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      const { pairabbr, userid } = newCurrencySchema.parse(body);
      console.log("body: ", body);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const SQLstatement = sqlstring.format(
        `
        INSERT INTO tablePairs (pairabbr, userid) VALUES (?,?);
        `,
        [pairabbr, userid]
      );
      await pool.query(SQLstatement);
      event.waitUntil(pool.end());
      console.log("SQLstatement: ", SQLstatement);
      return new Response(JSON.stringify({ pairabbr }), {
        status: 200,
      });
    } catch (error) {
      return new Response("Unable to add new currency", {
        status: 400,
      });
    }
  } else {
    return new Response("Invalid Method", {
      status: 405,
    });
  }
}
