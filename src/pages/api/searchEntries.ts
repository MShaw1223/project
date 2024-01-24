import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sqlquery = sqlstring.format("select * from tableTrades");
// const sqlquery = sqlstring.format(
//   "SELECT * FROM tableTrades ORDER BY tradeid DESC;"
// );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await pool.query(sqlquery);
    const rows = result.rows;
    console.log("Result searchEntries.ts:", rows);
    res.status(200).json(result.rows);
  } catch {
    console.error("Error executing query:", sqlquery);
    res.status(400).end();
  }
}
