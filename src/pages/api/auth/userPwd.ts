import { NextApiRequest } from "next";
import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { NextResponse } from "next/server";
import { generateKey } from "@/utils/protection/hash";
import { userPwdSchema } from "@/utils/protection/schema";
export const config = {
  runtime: "edge",
};

export default async function handler(req: NextApiRequest) {
  if (req.method === "POST") {
    try {
      // takes the request and extracts the body from the readable stream sent
      const body = await extractBody(req);
      // takes the passwd and username variables from the body object
      const { passwd, username } = userPwdSchema.parse(body);
      console.log("pwd: ", passwd);
      console.log("user: ", username);
      // generates the key for the new user
      const key = generateKey(username);
      // starts the pooled db connection
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      if (passwd === undefined || username === undefined) {
        throw new Error("Password or username undefined");
      }
      const keyCheckQuery = sqlstring.format(
        `
        select count(*) as count from tableUsers where authKey = ?
        `,
        [key]
      );
      const keyCheckResult = await pool.query(keyCheckQuery);
      const keyExists = keyCheckResult.rows[0].count > 0;
      // sql query and logic that checks if the key already exists; stops duplicate users edge case
      if (!keyExists) {
        // Key does not exist, proceed adding the user
        const sqlquery = sqlstring.format(
          `
          insert into tableUsers (username, passwd, authKey) values (?,?, ?)
          `,
          [username, passwd, key]
        );
        await pool.query(sqlquery);
        await pool.end();
        return NextResponse.json("successfully added user", { status: 200 });
      } else {
        // Key already exists, throws an error
        throw new Error("Key already exists");
      }
    } catch (error) {
      console.error("Failed to sign up, error: ", error);
      return NextResponse.json("Not allowed, account exists", { status: 403 });
    }
  } else {
    return NextResponse.json("Invalid HTTP method", { status: 405 });
  }
}
