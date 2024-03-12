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
      const accname = await req.body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      // finds accounts with the same accountname as the one given the request
      // orders by the account names
      const sqlquery = sqlstring.format(
        `
      SELECT accountid from tableAccounts
      WHERE accountname = ?
      `,
        [accname]
      );
      const result = await pool.query(sqlquery);
      await pool.end();
      console.log(sqlquery);
      // returns the account id
      console.log("accinfo: ", result.rows[0]);
      const response = result.rows[0].accountid;
      res.status(200).json(response); // return the account id and success (200)
    } catch (error) {
      console.error("Error executing query, details:", error);
      res.status(400).end();
    }
  } else {
    // if incorrect http method error thrown
    res.status(405).json({ error: "Method Not allowed" });
  }
}
