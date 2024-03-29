import { NextRequest, NextResponse } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { deleteAccountSchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { accountname } = deleteAccountSchema.parse(body);
      console.log("body", body);
      console.log("accountname: ", accountname);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const getAcctID = sqlstring.format(`
        select accountid from tableAccounts where accountname = '${accountname}'
      `);
      console.log("getAcctID: ", getAcctID);
      const placeholder = await pool.query(getAcctID);
      const accountID = placeholder.rows[0].accountid;
      console.log("acct id: ", accountID);
      const deleteAccountQuery = sqlstring.format(`
        DELETE FROM tableAccounts WHERE accountid = ${accountID}
      `);
      const deleteFrmTradeTbl = sqlstring.format(`
        delete from tableTrades where accountid = ${accountID}
      `);
      await pool.query(deleteFrmTradeTbl);
      await pool.query(deleteAccountQuery);
      await pool.end();
      console.log("sql: ", deleteAccountQuery);
      console.log("Account deleted: ", accountname);
      return NextResponse.json({ accountname }, { status: 200 });
    } catch (error) {
      console.error("Issue deleting account: ", error);
      return NextResponse.json("Error deleting account", {
        status: 400,
      });
    }
  }
  return NextResponse.json("Method not allowed", {
    status: 405,
  });
}
