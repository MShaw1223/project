import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const queryAvailablePairs = sqlstring.format(
  `
    SELECT pairabbr FROM tablePairs ORDER BY pairabbr
  `
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await pool.query(queryAvailablePairs);
    console.log("First row:", result.rows[0]); // Log the first row
    const pairabbrs = result.rows.map((row) => row.pairabbr); // Access pairabbr directly
    console.log("Pairs:", pairabbrs);
    res.status(200).json(pairabbrs); // return the pairs
  } catch (error) {
    console.error("Error executing query:", queryAvailablePairs);
    console.error("Error details:", error);
    res.status(400).end();
  }
}
