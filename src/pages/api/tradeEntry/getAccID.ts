import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const selected = await req.body;
      console.log("Selected Account: ", selected);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const sqlquery = sqlstring.format(
        `
        SELECT accountID from tableAccounts where accountname = ?
        `,
        [selected]
      );
      const indb = await pool.query(sqlquery);
      const accID = await indb.rows[0];
      await pool.end();
      console.log(sqlquery);
      console.log("account ID getaccid: ", accID);
      res.status(200).json({ accID });
    } catch (error) {
      console.error("Error processing request: ", error);
      res.status(400).json({ error: "Problem with request" });
    }
  } else {
    res.status(405).json({ error: "Method Not allowed" });
  }
}
