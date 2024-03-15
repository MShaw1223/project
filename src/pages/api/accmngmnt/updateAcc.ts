import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

export default async function editEntryHandler(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  try {
    if (req.method === "PUT") {
      const body = await extractBody(req);
      const { edits, accountname } = body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const sqlQuery = sqlstring.format(
        "UPDATE tableAccounts SET accountname = ? WHERE accountname = ?",
        [edits, accountname]
      );
      await pool.query(sqlQuery);
      event.waitUntil(pool.end());
    } else {
      throw new Error("Incorrect HTTP method");
    }
  } catch (error) {
    return new Response("Bad Request", {
      status: 400,
    });
  }
}
