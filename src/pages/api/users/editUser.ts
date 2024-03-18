import { extractBody } from "@/utils/extractBody";
import { generateKey } from "@/utils/protection/hash";
import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

export default async function editUser(req: NextApiRequest) {
  try {
    if (req.method === "PUT") {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const body = await extractBody(req);
      const { newInfo, user, field } = body;
      console.log("Body: ", body);
      let sqlStatement;
      if (field === "username") {
        const newKey = generateKey(newInfo);
        sqlStatement = sqlstring.format(
          "update tableUsers set username = ?, authKey = ? where username = ?",
          [newInfo, newKey, user]
        );
      } else if (field === "passwd") {
        sqlStatement = sqlstring.format(
          "update tableUsers set passwd = ? where username = ?",
          [newInfo, user]
        );
      } else {
        throw new Error("Incorrect field selected");
      }

      await pool.query(sqlStatement);
      await pool.end();
    }
  } catch (error) {
    return NextResponse.json("Bad Request", {
      status: 400,
    });
  }
}
