import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextFetchEvent, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { usernameAndPassword } from "@/utils/schema";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

async function loginUser(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
    throw new Error("Database or web token undefined");
  }
  const KEY = process.env.JWT_SECRET;
  console.log("request: ", req.body);
  const body = await extractBody(req);
  const { passwd, username } = usernameAndPassword.parse(body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
    SELECT passwd FROM tableusers WHERE username = (?);
    `,
    [username]
  );
  console.log("SQL: ", SQLstatement);

  const result = await pool.query(SQLstatement);

  console.log("result: ", result);

  const responsePayload = {
    passwd,
    username,
  };
  if (passwd) {
    const hashedPasswordFromDb = result.rows[0].passwd;
    console.log("hshd-Pwd-From-Db: ", hashedPasswordFromDb);

    const hpwd = btoa(hashedPasswordFromDb);
    const isMatch = hpwd === passwd;
    if (isMatch) {
      const token = jwt.sign(
        { responsePayload, admin: username === "ms" },
        KEY
      );

      return new Response(JSON.stringify({ token }), {
        status: 200,
      });
    }
  }

  event.waitUntil(pool.end());

  return new Response("Invalid username or password", {
    status: 401,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return loginUser(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
