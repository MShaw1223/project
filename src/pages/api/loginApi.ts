import zod from "zod";
import dotenv from "dotenv";
dotenv.config();
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const schema = zod.object({
  passwd: zod.string().max(60),
  username: zod.string().max(15),
});

async function loginUser(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
    throw new Error("Database or web token undefined");
  }
  const body = await extractBody(req);
  const { passwd, username } = schema.parse(body);

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

  event.waitUntil(pool.end());

  const responsePayload = {
    passwd,
    username,
  };

  if (passwd !== "") {
    const hashedPasswordFromDb = result.rows[0].passwd;
    const isMatch = await bcrypt.compare(passwd, hashedPasswordFromDb);

    if (isMatch) {
      const token = jwt.sign({ responsePayload }, process.env.JWT_SECRET, {
        expiresIn: "3d",
      });

      return new Response(JSON.stringify({ token }), {
        status: 200,
      });
    }
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
