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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function userPwd(req: NextRequest, event: NextFetchEvent) {
  console.log("Connected to database");
  const { username, unhashed_passwd } = await bodyFunc(req);
  const hashed_passwd = await passwordHash(unhashed_passwd);
  const passwd = hashed_passwd;
  const SQLstatement = sqlstring.format(
    `
    INSERT INTO tableUsers (username, passwd) VALUES (?, ?);
    `,
    [username, passwd]
  );
  console.log("SQLstatement", SQLstatement);
  try {
    await pool.query(SQLstatement);
    event.waitUntil(pool.end());
    return new Response(JSON.stringify({ username, passwd }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error inserting user into database:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function passwordHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

const bodyFunc = async (req: NextRequest) => {
  try {
    const body = await extractBody(req);
    console.log("body", body);
    const validatedBody = schema.parse(body);
    const username = validatedBody.username;
    const unhashed_passwd = validatedBody.unhashed_passwd;
    return { username, unhashed_passwd };
  } catch (error) {
    console.error("Error extracting body or parsing schema:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};
