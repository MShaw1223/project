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
      // Joins account and user table
      // then finds accounts with the same user as the userid in the URL
      // orders by the account names
      const sqlquery = sqlstring.format(
        `
      SELECT accountID, accountname from tableAccounts
      WHERE userID = ?
      ORDER BY accountName
      `,
        [userid]
      );
      const result = await pool.query(sqlquery);
      await pool.end();
      console.log(sqlquery);
      const accinfo = result.rows[0];
      // takes the array of rows from the result
      // and makes an array of account name / id objects
      console.log("accinfo: ", result.rows[0]);
      const array = result.rows.map((row) => ({
        id: row.accountid,
        name: row.accountname,
      }));
      console.log("array: ", array);
      res.status(200).json(array); // return the account names and success (200)
    } catch (error) {
      console.error("Error executing query, details:", error);
      res.status(400).end();
    }
  } else {
    // if incorrect http method error thrown
    res.status(405).json({ error: "Method Not allowed" });
  }
}
