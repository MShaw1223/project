import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const li = await req.body;
    console.log("li: ", li);
    if (li !== undefined) {
      try {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        // find pairs entered by the user ID and ordered by the pair
        const queryAvailablePairs = sqlstring.format(
          `
          SELECT pairabbr FROM tablePairs WHERE userid = ? ORDER BY pairabbr
          `,
          [li]
        );
        const result = await pool.query(queryAvailablePairs);
        await pool.end();
        const pairabbrs = result.rows.map((row) => row.pairabbr);
        console.log("Pairs: ", pairabbrs);
        res.status(200).json(pairabbrs); // return the pairs
      } catch (error) {
        console.error("Error fetching user: ", error);
        res.status(400).end();
      }
    } else {
      res.status(400).json("Cant parse li");
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(400).end();
  }
}
