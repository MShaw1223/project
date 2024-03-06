import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";
import sqlstring from "sqlstring";

export default async function editUser(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  try {
    if (req.method === "DELETE") {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const { userID } = await req.body;
      console.log("userID: ", userID);
      const sqlStatement = sqlstring.format(`
            delete from tableUsers where userID = ${userID};
            delete from tableAccounts where userID = ${userID};
            delete from tablePairs where userID = ${userID};
            delete from tableTrades where accountid in (select from tableaccounts where userID = ${userID});
        `);
      // could use join but would have to be its own statement
      await pool.query(sqlStatement);
      event.waitUntil(pool.end());
      console.log("sql: ", sqlStatement);
    } else {
      throw new Error("Incorrect HTTP request");
    }
  } catch (error) {
    return new Response("Bad Request", {
      status: 400,
    });
  }
}