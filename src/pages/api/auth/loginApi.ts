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
  event: NextFetchEvent,
  res: NextApiResponse
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
        return res.status(400).json({ error: "User not found" });
      }
      console.log("Entered pwd: ", passwd);
      const dbPassword: string = indb.rows[0].passwd;
      console.log("db pwd: ", dbPassword);
      if (passwd !== dbPassword) {
        return res.status(401).json({ error: "Passwords do not match" });
      }
      console.log("successful");
      return res.status(200).json({ username });
    } catch (error) {
      console.error("Unable to login: ", error);
      return res.status(500).json({ error: "internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Failed to sign in, Invalid Method" });
  }
}
