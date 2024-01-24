import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sqlquery = sqlstring.format("select * from tableTrades");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await pool.query(sqlquery);
    console.log("Result:", result);
    res.status(200).json(result.rows);
  } catch {
    console.error("Error executing query:", sqlquery);
    res.status(400).end();
  }
}
