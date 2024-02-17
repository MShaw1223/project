import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const username = await req.body;
      const query = `
        SELECT tableAccount.accountname from tableusers
        JOIN tableAccount ON tableusers.userID = tableAccount.userID
        WHERE tableusers.username = ?
        ORDER BY tableAccount.accountname
      `;
      const result = await pool.query(sqlstring.format(query, [username]));
      await pool.end();
      const accountname = result.rows.map((row) => row.accountname);
      console.log("acct name from findaccts.ts: ", accountname);
      res.status(200).json(accountname); // return the accounts
    } catch (error) {
      console.error("Error executing query, details:", error);
      res.status(400).end();
    }
  }
}
