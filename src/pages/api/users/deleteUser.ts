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
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      console.log("Inside the delUser function");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const body = await extractBody(req);
      const { userID } = body;
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
      await pool.end();
      console.log("sql tblUsers: ", tblUsersSql);
      console.log("sql tblAccounts: ", tblAccountsSql);
      console.log("sql tblPairs: ", tblPairsSql);
      console.log("sql tblTrades: ", tblTradesSql);
      return res.status(200).json("Account deleted");
    } catch (error) {
      return res.status(400).json("Bad request");
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
