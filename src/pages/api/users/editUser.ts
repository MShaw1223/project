import { generateKey } from "@/utils/protection/hash";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";
import sqlstring from "sqlstring";

export default async function editUser(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  try {
    if (req.method === "PUT") {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const { newInfo, userid, field } = await req.body;
      let sqlStatement;
      if (field === "username") {
        const newKey = generateKey(newInfo);
        sqlStatement = sqlstring.format(`
          update tableUsers
          set username = ${newInfo}
          authKey = ${newKey}
          where userid = ${userid}
        `);
      } else if (field === "passwd") {
        sqlStatement = sqlstring.format(`
          update tableUsers
          set passwd = ${newInfo}
          where userid = ${userid}
        `);
      } else {
        throw new Error("Incorrect field selected");
      }
      await pool.query(sqlStatement);
      event.waitUntil(pool.end());
    }
  } catch (error) {
    return new Response("Bad Request", {
      status: 400,
    });
  }
}
