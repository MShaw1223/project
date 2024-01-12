import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const queryAvailablePairs = sqlstring.format(
  `
    SELECT pairAbbr FROM tablePairs ORDER BY pairAbbr
  `
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await pool.query(queryAvailablePairs);
    console.log("Query result:", result);
    res.status(200).json(result); // return the pairs
  } catch (error) {
    console.error("Error executing query:", queryAvailablePairs);
    console.error("Error details:", error);
    res.status(400);
  }
}
