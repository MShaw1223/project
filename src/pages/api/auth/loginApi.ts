import { NextApiRequest } from "next";
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
      const reqbody = await extractBody(req);
      console.log(reqbody);
      const username: string = reqbody.username;
      console.log("username: ", username);
      const passwd: string = reqbody.passwd;
      console.log("password: ", passwd);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const getPwdSql = sqlstring.format(
        `
            SELECT passwd from tableUsers where username = ?
            `,
        [username]
      );
      const indb = await pool.query(getPwdSql);
      event.waitUntil(pool.end());
      if (indb.rows.length === 0) {
        // User not found in the database
        return new Response("User not found", {
          status: 400,
        });
      }
      console.log("Entered pwd: ", passwd);
      const dbPassword: string = indb.rows[0].passwd;
      console.log("db pwd: ", dbPassword);
      if (passwd === dbPassword) {
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
