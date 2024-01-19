import zod from "zod";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import { scrypt } from 'scrypt-js';
import * as crypto from 'crypto';

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "POST") {
    return userPwd(req, event);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}

const schema = zod.object({
  username: zod.string().max(15),
  unhashed_passwd: zod.string().max(60),
});


async function userPwd(req: NextRequest, event: NextFetchEvent) {
  let body, username, unhashed_passwd, passwd, pool, SQLstatement;
  try {
    body = await extractBody(req);
    let parsedBody;
    if (typeof body === "string") {
      parsedBody = JSON.parse(body);
    } else {
      parsedBody = body;
    }
    console.log("parsedBody", parsedBody);
    const validatedBody = schema.parse(parsedBody);
    username = validatedBody.username;
    unhashed_passwd = validatedBody.unhashed_passwd;
  } catch (error) {
    console.error("Error extracting body or parsing schema:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
  try {
    const salt = crypto.randomBytes(16).toString('hex'); // salt
    const unhashed_passwdBuffer = Buffer.from(unhashed_passwd, 'utf-8'); // password buffer
    const passwd = await new Promise<string>((resolve, reject) => {
      scrypt(unhashed_passwdBuffer, Buffer.from(salt, 'hex'), 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  } catch (error) {
    const key = await scrypt(unhashed_passwdBuffer, salt, 16384, 8, 1, 32); // generate hash
    const passwd = key.toString('hex');
  } catch (error) {
    console.error("Error hashing password:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log("Connected to database");
    SQLstatement = sqlstring.format(
      `
        INSERT INTO tableUsers (username, passwd) VALUES (?, ?);
      `,
      [username, passwd]
    );
    console.log("SQLstatement", SQLstatement);
    await pool.query(SQLstatement);
    event.waitUntil(pool.end());
  } catch (error) {
    console.error("Error inserting user into database:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
  return new Response(JSON.stringify({ username, passwd }), {
    status: 200,
  });
}
