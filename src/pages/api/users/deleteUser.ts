import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import sqlstring from "sqlstring";

//this deletes all traces of data in the database associated with the userid that is deleted
// ie the logged in user
export const config = {
  runtime: "edge",
};

export default async function delUser(req: NextApiRequest) {
  if (req.method === "DELETE") {
    console.log("correct method");
    try {
      console.log("Inside the delUser function");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const body = await extractBody(req);
      console.log("body: ", body);
      const { userID } = body;
      console.log("userID: ", userID);
      const accountIDquery = sqlstring.format(
        "SELECT accountid FROM tableAccounts WHERE userid = ?",
        [userID]
      );
      const accountsIDResult = await pool.query(accountIDquery);
      const accountID = accountsIDResult.rows[0]?.accountid; // optional chaining for if no accountID
      //  the SQL query to delete trades associated with the account
      const tblTradesSql = accountID
        ? sqlstring.format(
            "DELETE FROM tableTrades WHERE accountid IN (SELECT accountID FROM tableAccounts WHERE userID = ?);",
            [userID]
          )
        : null; // If there's no accountID, set tblTradesSql to null
      // the SQL query to delete accounts associated with the user
      const accountsTableSql = sqlstring.format(
        "DELETE FROM tableAccounts WHERE userID = ?;",
        [userID]
      );
      // the SQL query to delete pairs associated with the account
      const pairsTableSql = accountID
        ? sqlstring.format("DELETE FROM tablePairs WHERE userID = ?;", [userID])
        : null; // If there's no accountID, set pairsTableSql to null
      // the SQL query to delete the user
      const usersTableSql = sqlstring.format(
        "DELETE FROM tableUsers WHERE userID = ?;",
        [userID]
      );
      // Perform deletions
      if (tblTradesSql) {
        await pool.query(tblTradesSql);
        console.log("sql tblTrades: ", tblTradesSql);
      }
      await pool.query(accountsTableSql);
      if (pairsTableSql) {
        await pool.query(pairsTableSql);
        console.log("sql tblPairs: ", pairsTableSql);
      }
      await pool.query(usersTableSql);
      await pool.end();
      return NextResponse.json("Deleted user", { status: 200 });
    } catch (error) {
      console.error("Error deleting user: ", error);
      console.error("Stack trace: ", (error as Error).stack);
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
