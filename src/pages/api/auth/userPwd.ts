import { NextApiRequest, NextApiResponse } from "next";
import { extractBody } from "@/utils/extractBody";
import zod from "zod";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { NextFetchEvent } from "next/server";
import { generateKey } from "@/utils/protection/hash";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  username: zod.string(),
  passwd: zod.string(),
});

async function handleUserPwd(req: NextApiRequest, event: NextFetchEvent) {
  console.log("in handleUserPwd in userPwd.ts");
  try {
    console.log("in the try catch block");
    const body = await extractBody(req);
    const { passwd, username } = schema.parse(body);
    console.log("pwd: ", passwd);
    console.log("user: ", username);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const key = generateKey(username);
    if (passwd === undefined) {
      throw new Error("Password undefined");
    } else {
      const sqlquery = sqlstring.format(
        `
          INSERT INTO tableUsers (username, passwd, authKey) VALUES (?,?, ?)
          `,
        [username, passwd, key]
      );
      console.log(sqlquery);

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
}

export default async function handler(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  if (req.method === "POST") {
    return handleUserPwd(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
