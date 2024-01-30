//import bcryptjs from "bcryptjs";
import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import { useRouter } from "next/router";
import bcryptjs from "bcryptjs";

const schema = zod.object({
  passwd: zod.string().max(60),
  username: zod.string().max(15),
});

async function loginUser(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const { passwd, username } = schema.parse(body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
            SELECT * FROM tableusers WHERE username = (?);
        `,
    [username]
  );
  console.log("SQL: ", SQLstatement);
  const result = await pool.query(SQLstatement);
  console.log("result: ", result);
  event.waitUntil(pool.end());
  if (passwd) {
    return new Response(JSON.stringify({ result }), {
      status: 200,
    });
  }
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
