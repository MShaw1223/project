import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// export const config = {
//   runtime: "edge",
// };

const schema = zod.object({
  username: zod.string().max(15),
  unhashed_passwd: zod.string().max(60),
});

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return userPwd(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}

async function userPwd(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const { username, unhashed_passwd } = schema.parse(body);
  const hashed_passwd = await passwordHash(unhashed_passwd);
  const passwd = hashed_passwd;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const SQLstatement = sqlstring.format(
    `
    INSERT INTO tableUsers (username, passwd) VALUES (?, ?)
    `,
    [username, passwd]
  );
  console.log("SQLstatement", SQLstatement);

  await pool.query(SQLstatement);

  event.waitUntil(pool.end());

  const responsePayload = {
    username,
    passwd,
  };

  return new Response(JSON.stringify({ responsePayload }), {
    status: 200,
  });
}

async function passwordHash(unhashed_passwd: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(unhashed_passwd, salt);
  return hashedPassword;
}
