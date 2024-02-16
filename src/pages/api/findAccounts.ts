import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";

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
    const router = useRouter();
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const { li } = router.query;
    console.log(li);
    if (li !== undefined) {
      const user = await fetch("/api/auth/userFromHash", {
        method: "POST",
        body: JSON.stringify(li),
        headers: { "Content-Type": "application/json" },
      });
      const lgdin = await user.json();
      console.log("logged in: ", lgdin);
      const username = lgdin.loggedIn;
      const queryAvailableAccs =
        "select accountname from tableAccount where userID = ? ORDER BY accountname";
      const acc_ID_get = "select userID from table users where username = ?";
      const accIDres = await pool.query(
        sqlstring.format(acc_ID_get, [username])
      );
      console.log("Account ID response: ", accIDres);
      const result = await pool.query(
        sqlstring.format(queryAvailableAccs, [accIDres])
      );
      const accountname = result.rows.map((row) => row.accountname);
      console.log("Accounts:", accountname);
      res.status(200).json(accountname); // return the accounts
    }
  } catch (error) {
    console.error("Error executing query, details:", error);
    res.status(400).end();
  }
}
