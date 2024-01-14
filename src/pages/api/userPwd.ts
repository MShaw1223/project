import bcrypt from "bcrypt";
import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";

const schema = zod.object({
  username: zod.string().max(15),
  passwd: zod.string().max(60),
});

async function newUser(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const { username, passwd } = schema.parse(body);

  console.log("body", body);

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(passwd, saltRounds);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
      INSERT INTO tableUsers (username, passwd) VALUES (?, ?);
    `,
    [username, hashedPassword]
  );
  console.log("SQLstatement", SQLstatement);
  await pool.query(SQLstatement);
  event.waitUntil(pool.end());
  return new Response(JSON.stringify({ username, passwd }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return newUser(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
