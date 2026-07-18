import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // check request method
  if (req.method === "POST") {
    try {
      const userid = await req.body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      //  finds accounts with the same user as the userid in the URL
      // orders by the account names
      const sqlquery = sqlstring.format(
        `
      SELECT accountname from tableAccounts
      WHERE userID = ?
      ORDER BY accountName
      `,
        [userid]
      );
      const result = await pool.query(sqlquery);
      await pool.end();
      // takes the array of rows from the result
      // and makes an array of account names
      const array = result.rows.map((row) => row.accountname);
      res.status(200).json(array); // return the account names and success (200)
    } catch (error) {
      res.status(400).end();
    }
  } else {
    // if incorrect http method error thrown
    res.status(405).json({ error: "Method Not allowed" });
  }
}
