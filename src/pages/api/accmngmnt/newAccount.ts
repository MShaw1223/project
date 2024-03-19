import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newAccountSchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      console.log("body: ", body);
      const { accountname, userid } = newAccountSchema.parse(body);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const SQLstatement = sqlstring.format(
        `
        INSERT INTO tableAccounts (accountname, userid) VALUES (?, ?);
      `,
        [accountname, userid]
      );
      await pool.query(SQLstatement);
      await pool.end();
      return NextResponse.json(
        { accountname, userid },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("Issue creating account: ", error);
      return NextResponse.json("Server error", {
        status: 500,
      });
    }
  } else {
    return NextResponse.json("Method not allowed", {
      status: 405,
    });
  }
}
