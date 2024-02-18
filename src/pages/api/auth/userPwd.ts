import { NextApiRequest } from "next";
import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { NextFetchEvent } from "next/server";
import { generateKey } from "@/utils/protection/hash";
import { userPwdSchema } from "@/utils/protection/schema";

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
      const { passwd, username } = userPwdSchema.parse(body);
      console.log("pwd: ", passwd);
      console.log("user: ", username);
      const key = generateKey(username);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      if (passwd === undefined || username === undefined) {
        throw new Error("Password or username undefined");
      }
      if (passwd !== undefined && username !== undefined) {
        const sqlquery = sqlstring.format(
          `
          INSERT INTO tableUsers (username, passwd, authKey) VALUES (?,?, ?)
          `,
          [username, passwd, key]
        );
        await pool.query(sqlquery);
        event.waitUntil(pool.end());
        return new Response("Success", {
          status: 200,
        });
      }
    } catch (error) {
      console.error("Failed to sign up, error: ", error);
      throw new Error("Issue with data submission");
    }
  } else {
    return new Response("Invalid Method", {
      status: 405,
    });
  }
}
