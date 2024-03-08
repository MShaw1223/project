import { NextFetchEvent, NextRequest } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { deleteAccountSchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
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
        select accountid from tableAccounts where accountname = "${accountname}";
      `);
      console.log("getAcctID", getAcctID);
      await pool.query(getAcctID);
      const deleteAccountQuery = sqlstring.format(`
        DELETE FROM tableAccounts WHERE accountid = ${getAcctID};
      `);
      const deleteFrmTradeTbl = sqlstring.format(`
        delete from tableTrades where accountid = ${getAcctID};
      `);
      await pool.query(deleteFrmTradeTbl);
      await pool.query(deleteAccountQuery);
      event.waitUntil(pool.end());
      console.log("sql: ", deleteAccountQuery);
      console.log("Account deleted: ", accountname);
      return new Response(JSON.stringify({ accountname }), {
        status: 200,
      });
    } catch (error) {
      console.error("Issue deleting account: ", error);
      return new Response("Error deleting account", {
        status: 400,
      });
    }
  }
  return new Response("Method not allowed", {
    status: 405,
  });
}
