import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const queryAvailableAccs = sqlstring.format(
  `
    select accountname from tableAccount ORDER BY accountname 
  `
);
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
    const result = await pool.query(queryAvailableAccs);
    const accountname = result.rows.map((row) => row.accountname);
    console.log("Accounts:", accountname);
    res.status(200).json(accountname); // return the accounts
  } catch (error) {
    console.error("Error executing query:", queryAvailableAccs);
    console.error("Error details:", error);
    res.status(400).end();
  }
}
