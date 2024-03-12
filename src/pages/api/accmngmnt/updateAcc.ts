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
      const findAccID = sqlstring.format(
        `
          SELECT accountid from tableAccounts
          WHERE accountname = ${accountname}
        `
      );
      const result = await pool.query(findAccID);
      await pool.end();
      const response = result.rows[0].accountid;
      const changeAccName = sqlstring.format(
        `
          UPDATE tableAccounts
          SET accountname = ${edits},
          WHERE accountid = ${response}
        `
      );
      await pool.query(changeAccName);
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
