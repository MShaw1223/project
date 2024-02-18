import comparePasswords from "@/utils/protection/comparePwd";
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { NextFetchEvent } from "next/server";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

export default async function handler(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      console.log(body);
      const username = body.username;
      console.log("username: ", username);
      const passwd = body.passwd;
      console.log("password: ", passwd);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const sqlquery = sqlstring.format(
        `
            SELECT passwd from tableUsers where username = ?
            `,
        [username]
      );
      const indb = await pool.query(sqlquery);
      event.waitUntil(pool.end());
      const password = passwd;
      console.log("Entered pwd: ", password);
      const dbPassword = indb.rows[0].passwd;
      console.log("db pwd: ", dbPassword);
      const isMatch = comparePasswords(password, dbPassword);
      if (isMatch === true) {
        console.log("successful");
        const loggedIn = username;
        return new Response(JSON.stringify({ username: loggedIn }), {
          status: 200,
        });
      } else {
        throw new Error("Passwords do not match");
      }
    } catch (error) {
      console.error("Unable to login: ", error);
    }
  } else {
    return new Response("Failed to sign in, Invalid Method", {
      status: 405,
    });
  }
}
