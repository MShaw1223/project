import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { NextFetchEvent, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { usernameAndPassword } from "@/utils/schema";
import { extractBody } from "@/utils/extractBody";
import { comparePasswords } from "@/utils/bcryptUtils";

export const config = {
  runtime: "edge",
};

async function loginUser(req: NextRequest, event: NextFetchEvent) {
  try {
    if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
      throw new Error("Database or web token undefined");
    }
    const KEY = process.env.JWT_SECRET;
    console.log("request: ", req.body);
    const body = await extractBody(req);
    const { unhashedpasswd, username } = usernameAndPassword.parse(body);

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
      unhashedpasswd,
      username,
    };
    if (unhashedpasswd) {
      const hashedPasswordFromDb = result.rows[0].passwd;
      console.log("DB-Password: ", hashedPasswordFromDb);

      const isMatch = await comparePasswords(
        unhashedpasswd,
        hashedPasswordFromDb
      );
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
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return loginUser(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
