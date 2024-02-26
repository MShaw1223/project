import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { error } from "console";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("SE reqbody: ", req.body);

    const accountid = await req.body;
    if (accountid !== undefined) {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const sqlquery = sqlstring.format(
        "SELECT * FROM tableTrades WHERE accountid = ?;",
        [accountid]
      );
      const result = await pool.query(sqlquery);
      await pool.end();
      const rows = result.rows;
      console.log("Result searchEntries.ts: ", rows);
      res.status(200).json(result.rows);
    } else {
      throw new Error("AccountID is undefined");
    }
  } catch {
    console.error("Unable to execute query:", error);
    res.status(400).end();
  }
}
