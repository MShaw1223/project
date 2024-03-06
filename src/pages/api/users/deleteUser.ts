import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";
import sqlstring from "sqlstring";

//this deletes all traces of data in the database associated with the userid that is deleted
// ie the logged in user
export const config = {
  runtime: "edge",
};

export default async function delUser(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  if (req.method === "DELETE") {
    try {
      console.log("Inside the delUser function");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const { userID } = await req.body;
      console.log("userID: ", userID);
      const tblUsersSql = sqlstring.format(`
        delete from tableUsers where userID = ${userID};
      `);
      const tblAccountsSql = sqlstring.format(`
        delete from tableAccounts where userID = ${userID};
      `);
      const tblPairsSql = sqlstring.format(`
        delete from tablePairs where userID = ${userID};
      `);
      const tblTradesSql = sqlstring.format(`
        delete from tableTrades where accountid in (select from tableaccounts where userID = ${userID});
      `);
      // could use join but would have to be its own statement
      await pool.query(tblUsersSql);
      await pool.query(tblAccountsSql);
      await pool.query(tblPairsSql);
      await pool.query(tblTradesSql);
      event.waitUntil(pool.end());
      console.log("sql tblUsers: ", tblUsersSql);
      console.log("sql tblAccounts: ", tblAccountsSql);
      console.log("sql tblPairs: ", tblPairsSql);
      console.log("sql tblTrades: ", tblTradesSql);
      return new Response("Account deleted", {
        status: 200,
      });
    } catch (error) {
      return new Response("Bad Request", {
        status: 400,
      });
    }
  } else {
    throw new Error("Incorrect HTTP request");
  }
}
