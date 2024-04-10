import { NextApiRequest } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { NextResponse } from "next/server";
import { extractBody } from "@/utils/extractBody";
export const config = {
  runtime: "edge",
};

export default async function handler(req: NextApiRequest) {
  if (req.method === "POST") {
    try {
      // takes the request and extracts the body from the readable stream sent
      const reqbody = await extractBody(req);
      // takes the username variable from the reqbody object
      const username: string = reqbody.username;
      // takes the passwd variable from the reqbody object
      const passwd: string = reqbody.passwd;
      // starts the pooled db connection
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      // queries the tableusers table of the db for the passwd of the entered username
      const getPwdSql = sqlstring.format(
        `
            SELECT passwd from tableUsers where username = ?
            `,
        [username]
      );
      const indb = await pool.query(getPwdSql);
      await pool.end();
      if (indb.rows.length === 0) {
        // User not found in the database
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }
      const dbPassword: string = indb.rows[0].passwd;
      // checks the entered password matches the password in the database
      if (passwd !== dbPassword) {
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 401 }
        );
      }
      return NextResponse.json({ status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "internal server error" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Failed to sign in, Invalid Method" },
      { status: 405 }
    );
  }
}
