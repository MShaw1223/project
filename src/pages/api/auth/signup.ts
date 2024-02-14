import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "../../../utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import zod from "zod";
import { useRouter } from "next/router";

const schema = zod.object({
  username: zod.string(),
  passwd: zod.string(),
});

async function signupFunc(req: NextRequest) {
  const router = useRouter();
  try {
    const body = await extractBody(req);
    const { passwd, username } = schema.parse(body);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log("pwd", passwd);
    if (passwd === undefined) {
      throw new Error("Password undefined");
    } else {
      const sqlquery = sqlstring.format(
        `
        INSERT INTO tableUsers (username, passwd) VALUES (?,?)
        `,
        [username, passwd]
      );
      console.log(sqlquery);

      await pool.query(sqlquery);

      await pool.end();
    }
    router.push("/home");
  } catch (error) {
    console.error("Failed to sign up, error: ", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

export default async function handler(req: NextRequest) {
  if (req.method === "POST") {
    return signupFunc(req);
  }
  return new Response("Invalid Method", {
    status: 405,
  });
}
