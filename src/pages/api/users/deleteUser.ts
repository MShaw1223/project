import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";

//this deletes all traces of data in the database associated with the userid that is deleted
// ie the logged in user
export const config = {
  runtime: "edge",
};

export default async function delUser(
  req: NextApiRequest,
  res: NextApiResponse,
  event: NextFetchEvent
) {
  if (req.method === "DELETE") {
    console.log("correct method");
    try {
      console.log("Inside the delUser function");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const body = await extractBody(req);
      const { userID } = body;
      console.log("userID: ", userID);
      const accountIDquery = sqlstring.format(
        "select accountid from tableAccounts where userid = ?",
        [userID]
      );
      const accountsIDResult = await pool.query(accountIDquery);
      const accountID = accountsIDResult.rows[0].accountid;
      const tblTradesSql = sqlstring.format(
        "DELETE from tableTrades where accountid = ?;",
        [accountID]
      );
      const userAccountPairsTableSql = sqlstring.format(
        "DELETE tableUsers, tableAccounts, tablePairs FROM tableUsers JOIN tableAccounts, tablePairs ON tableUsers.userID = tableAccounts.userID, JOIN tableUsers, tablePairs ON tableUsers.userID = tablePairs.userID WHERE userID = ?;",
        [userID]
      );
      await pool.query(userAccountPairsTableSql);
      await pool.query(tblTradesSql);
      event.waitUntil(pool.end());
      console.log("sql tblUsers: ", userAccountPairsTableSql);
      console.log("sql tblTrades: ", tblTradesSql);
      return res.status(200).json({ userID });
    } catch (error) {
      console.error("Error deleting user: ", error);
      return res.status(400).json("Bad request");
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
