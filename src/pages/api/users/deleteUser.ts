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
      await pool.end();
      console.log("sql tblUsers: ", userAccountPairsTableSql);
      console.log("sql tblTrades: ", tblTradesSql);
      return NextResponse.json({ userID }, { status: 200 });
    } catch (error) {
      console.error("Error deleting user: ", error);
      return NextResponse.json("Bad request", { status: 400 });
    }
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
