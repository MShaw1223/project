import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

/* 
where userID = 1
where userID = ${loggedIn} 
have hardcoded userID for now,  dynamic idea above
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const username = req.body;
    if (username) {
      const AvailAcs = `select accountname from tableAccount where userID = ? ORDER BY accountname`;
      const acc_ID_get = "select userID from tableusers where username = ?";
      const accIDres = await pool.query(
        sqlstring.format(acc_ID_get, [username])
      );
      console.log("Account ID response: ", accIDres);
      const accID = accIDres.rows[0].userid;
      const result = await pool.query(sqlstring.format(AvailAcs, [accID]));
      const accountname = result.rows.map((row) => row.accountname);
      console.log("Accounts:", accountname);
      res.status(200).json(accountname); // return the accounts
    }
  } catch (error) {
    console.error("Error executing query, details:", error);
    res.status(400).end();
  }
}
