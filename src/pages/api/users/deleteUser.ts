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
      const usersTableSql = sqlstring.format(
        "DELETE tableUsers WHERE userID = ?;",
        [userID]
      );
      const accountsTableSql = sqlstring.format(
        "DELETE from tableAccounts WHERE userID = ?;",
        [userID]
      );
      const pairsTableSql = sqlstring.format(
        "DELETE from tablePairs WHERE userID = ?;",
        [userID]
      );
      await pool.query(usersTableSql);
      await pool.query(pairsTableSql);
      await pool.query(accountsTableSql);
      await pool.query(tblTradesSql);
      await pool.end();
      console.log("sql tblUsers: ");
      console.log("sql tblTrades: ", tblTradesSql);
      return NextResponse.json("Deleted user", { status: 200 });
    } catch (error) {
      console.error("Error deleting user: ", error);
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
