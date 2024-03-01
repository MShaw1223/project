import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";
import sqlstring from "sqlstring";

export default async function editEntryHandler(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  try {
    if (req.method === "PUT") {
      const { edits, accountname } = await req.body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      //this isnt correct should be accountname --> edit all associated updateaccountfiles <--
      const sqlQuery = sqlstring.format(`
          UPDATE tableAccounts
          SET accountname = ${edits},
          WHERE accountname = ${accountname}
        `);
      await pool.query(sqlQuery);
      event.waitUntil(pool.end());
    } else {
      throw console.error("Incorrect HTTP method");
    }
  } catch (error) {
    return new Response("Bad Request", {
      status: 400,
    });
  }
}
