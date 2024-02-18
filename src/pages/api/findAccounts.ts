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
      const username = await req.body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      // Joins account and user table
      // then finds accounts with the same user as the inputted username
      // orders by the account names
      const query = `
        SELECT tableAccounts.accountname from tableusers
        JOIN tableAccounts ON tableusers.userID = tableAccounts.userID
        WHERE tableusers.username = ?
        ORDER BY tableAccounts.accountname
      `;
      const result = await pool.query(sqlstring.format(query, [username]));
      await pool.end();
      const accountname = result.rows.map((row) => row.accountname);
      // takes the array of rows from the result
      // and makes an array of account names
      console.log("acct name from findaccts.ts: ", accountname);
      res.status(200).json(accountname); // return the account names and success (200)
    } catch (error) {
      console.error("Error executing query, details:", error);
      res.status(400).end();
    }
  } else {
    // if incorrect http method error thrown
    res.status(405).json({ error: "Method Not allowed" });
  }
}
