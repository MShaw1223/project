import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  username: zod.string().max(15),
  passwd: zod.string().max(60),
});

async function handleUserPwd(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  console.log("body", body);
  const { passwd, username } = schema.parse(body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const checkUser = sqlstring.format("SELECT * FROM tableUsers");
  console.log("checkUser", checkUser);

  const SQLstatement = sqlstring.format(
    `
    INSERT INTO tableUsers (passwd, username) VALUES (?, ?)
    `,
    [passwd, username]
  );
  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  const responsePayload = {
    passwd,
    username,
  };

  return new Response(JSON.stringify({ responsePayload }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return handleUserPwd(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
