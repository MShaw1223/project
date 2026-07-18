import { NextResponse, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";
import { newCurrencySchema } from "@/utils/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      const { pairabbr, userid } = newCurrencySchema.parse(body);
      const SQLstatement = sqlstring.format(
        `
        INSERT INTO tablePairs (pairabbr, userid) VALUES (?,?);
        `,
        [pairabbr, userid]
      );
      await pool.query(SQLstatement);
      await pool.end();
      return NextResponse.json(
        { pairabbr },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json("Unable to add new currency", {
        status: 400,
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { userID, pairID } = body;
      const deletePairQuery = sqlstring.format(
        `
              DELETE FROM tablePairs WHERE userid = ? and pairid = ?
            `,
        [userID, pairID]
      );
      await pool.query(deletePairQuery);
      await pool.end();
      return NextResponse.json({
        status: 200,
      });
    } catch (error) {
      return NextResponse.json("Error deleting pair", {
        status: 400,
      });
    }
  } else {
    return NextResponse.json("Invalid Method", {
      status: 405,
    });
  }
}
