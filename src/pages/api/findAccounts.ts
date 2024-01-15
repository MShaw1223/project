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
/* where userID = ${loggedIn} */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await pool.query(queryAvailableAccs);
    const accnames = result.rows.map((row) => row.accountname);
    console.log("Accounts:", accnames);
    res.status(200).json(accnames); // return the accounts
  } catch (error) {
    console.error("Error executing query:", queryAvailableAccs);
    console.error("Error details:", error);
    res.status(400).end();
  }
}

/*
const queryAvailableAccs = sqlstring.format(
  `
    SELECT
      tc.*,
      CONCAT(qp.pairAbbr, bp.pairAbbr) AS currencyPair
    FROM
      tableCurrencies tc
    JOIN
      tablePairs qp ON tc.quotepairID = qp.pairID
    JOIN
      tablePairs bp ON tc.basepairID = bp.pairID;
  `
);

const findAvailablePairs 

export default findAvailablePairs;
*/
