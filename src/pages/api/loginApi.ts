//import bcryptjs from "bcryptjs";
import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import { useRouter } from "next/router";

const schema = zod.object({
  username: zod.string().max(15),
  passwd: zod.string().max(60),
});

async function loginUser(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const { username, passwd } = schema.parse(body);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
            SELECT * FROM tableusers WHERE username = ?;
        `,
    [username]
  );
  const result = await pool.query(SQLstatement);
  const user = result.rows[0];

  if (user) {
    const router = useRouter()
    // const passwordMatch = await bcryptjs.compare(passwd, user.passwd);
    // if (passwordMatch) {
      router.push('/home');
    return new Response(JSON.stringify({ username, passwd }), {
      status: 200,
    });
  }
  // }

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
