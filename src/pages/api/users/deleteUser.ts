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
      // Check if there are any records in the tables pairs, accounts, and trades for the specified userID
      const checkAccountsSql = sqlstring.format(`
        SELECT COUNT(*) AS count FROM tableAccounts WHERE userID = ${userID};
      `);
      const accountsResult = await pool.query(checkAccountsSql);
      const accountCount = accountsResult.rows[0].count;
      if (accountCount > 0) {
        // Delete records from tableAccounts
        const tblAccountsSql = sqlstring.format(`
          DELETE FROM tableAccounts WHERE userID = ${userID};
        `);
        await pool.query(tblAccountsSql);
      }
      const checkPairsSql = sqlstring.format(`
        SELECT COUNT(*) AS count FROM tablePairs WHERE userID = ${userID};
      `);
      const pairsResult = await pool.query(checkPairsSql);
      const pairCount = pairsResult.rows[0].count;
      if (pairCount > 0) {
        // Delete records from tablePairs
        const tblPairsSql = sqlstring.format(`
          DELETE FROM tablePairs WHERE userID = ${userID};
        `);
        await pool.query(tblPairsSql);
      }
      const checkTradesSql = sqlstring.format(`
        SELECT COUNT(*) AS count FROM tableTrades WHERE userID = ${userID};
      `);
      const tradesResult = await pool.query(checkTradesSql);
      const tradeCount = tradesResult.rows[0].count;
      if (tradeCount > 0) {
        // Delete records from tableTrades
        const tblTradesSql = sqlstring.format(`
          DELETE FROM tableTrades WHERE userID = ${userID};
        `);
        await pool.query(tblTradesSql);
      }
      // unconditionally deletes user as to enter the aplication you must have a user
      //  otherwise entering a trade, pair, or account into the db is optional
      const tblUsersSql = sqlstring.format(`
        delete from tableUsers where userID = ${userID};
      `);
      await pool.query(tblUsersSql);
      await pool.end();
      console.log("sql tblUsers: ", tblUsersSql);
      return res.status(200).json("Account deleted");
    } catch (error) {
      console.error("Error deleting user: ", error);
      return res.status(400).json("Bad request");
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
