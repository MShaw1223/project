import { extractBody } from "@/utils/extractBody";
import { keyGenerator } from "@/utils/hash";
import { Pool } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  if (req.method === "PUT") {
    const body = await extractBody(req);
    const { newInfo, user, field } = body;
    let sqlStatement;
    if (field === "username") {
      const newKey = keyGenerator(newInfo);
      sqlStatement = sqlstring.format(
        "update tableUsers set username = ?, authKey = ? where username = ?",
        [newInfo, newKey, user]
      );
    } else if (field === "passwd") {
      sqlStatement = sqlstring.format(
        "update tableUsers set passwd = ? where username = ?",
        [newInfo, user]
      );
    } else {
      throw new Error("Incorrect field selected");
    }
    await pool.query(sqlStatement);
    await pool.end();
  } else if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { userID } = body;
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
        : null;
      const usersTableSql = sqlstring.format(
        "DELETE FROM tableUsers WHERE userID = ?;",
        [userID]
      );
      if (tblTradesSql) {
        await pool.query(tblTradesSql);
      }
      await pool.query(accountsTableSql);
      if (pairsTableSql) {
        await pool.query(pairsTableSql);
      }
      await pool.query(usersTableSql);
      await pool.end();
      return NextResponse.json("Deleted user", { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
  }
}
