import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "../extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import zod from "zod";

const schema = zod.object({
  username: zod.string(),
  passwd: zod.string(),
});

async function signupFunc(req: NextRequest, event: NextFetchEvent) {
  try {
    const body = await extractBody(req);
    const { passwd, username } = schema.parse(body);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log("pwd", passwd);
    if (passwd === undefined) {
      throw new Error("Password undefined");
    } else {
      const sqlquery = sqlstring.format(
        `
      INSERT INTO tableUsers (username, passwd) VALUES (?,?)
      `,
        [username, passwd]
      );

      await pool.query(sqlquery);

      event.waitUntil(pool.end());
      const input = { username, passwd };
      return new Response(JSON.stringify({ input }), {
        status: 200,
      });
    }
  } catch (error) {
    console.error("Failed to sign up, error: ", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return signupFunc(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
