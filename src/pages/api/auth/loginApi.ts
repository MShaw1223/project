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
      const reqbody = await extractBody(req);
      console.log(reqbody);
      const username: string = reqbody.username;
      console.log("username: ", username);
      const passwd: string = reqbody.passwd;
      console.log("password: ", passwd);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
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
      console.log("Entered pwd: ", passwd);
      const dbPassword: string = indb.rows[0].passwd;
      console.log("db pwd: ", dbPassword);
      if (passwd !== dbPassword) {
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 401 }
        );
      }
      console.log("successful");
      return NextResponse.json({ username }, { status: 200 });
    } catch (error) {
      console.error("Unable to login: ", error);
      console.error("Stack trace: ", (error as Error).stack);
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
