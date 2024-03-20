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
        "select accountid from tableAccounts where userid = ?",
        [userID]
      );
      const accountsIDResult = await pool.query(accountIDquery);
      const accountID = accountsIDResult.rows[0]?.accountid; // optional chaining for if no accountID
      const usersTableSql = sqlstring.format(
        "DELETE from tableUsers WHERE userid = ?;",
        [userID]
      );
      const accountsTableSql = sqlstring.format(
        "DELETE from tableAccounts WHERE userID = ?;",
        [userID]
      );
      const tblTradesSql = accountID
        ? sqlstring.format("DELETE FROM tableTrades WHERE accountid = ?;", [
            accountID,
          ])
        : null; // If there's no accountID, set tblTradesSql to null
      const pairsTableSql = accountID
        ? sqlstring.format("DELETE FROM tablePairs WHERE accountid = ?;", [
            accountID,
          ])
        : null; // If there's no accountID, set pairsTableSql to null

      await pool.query(usersTableSql);
      await pool.query(accountsTableSql);
      if (tblTradesSql) {
        await pool.query(tblTradesSql);
        console.log("sql tblTrades: ", tblTradesSql);
      }
      if (pairsTableSql) {
        await pool.query(pairsTableSql);
        console.log("sql tblPairs: ", pairsTableSql);
      }
      await pool.end();
      console.log("sql tblUsers: ");
      console.log("sql tblTrades: ", tblTradesSql);
      return NextResponse.json("Deleted user", { status: 200 });
    } catch (error) {
      console.error("Error deleting user: ", error);
      console.error("Stack trace: ", (error as Error).stack);
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
