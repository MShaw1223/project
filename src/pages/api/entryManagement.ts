import { extractBody } from "@/utils/extractBody";
import { deleteEntrySchema } from "@/utils/protection/schema";
import { Pool } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import sqlstring from "sqlstring";

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
      const accountid: number = body;
      const sqlquery = sqlstring.format(
        "SELECT * FROM tableTrades WHERE accountid = ?;",
        [accountid]
      );
      const result = await pool.query(sqlquery);
      await pool.end();
      return NextResponse.json(result.rows, { status: 200 });
    } catch {
      return NextResponse.json({ status: 400 });
    }
  } else if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { tradesid, accountid } = deleteEntrySchema.parse(body);
      const deleteEntryQuery = sqlstring.format(
        `
              DELETE FROM tableTrades WHERE tradesid = ? and accountid = ?
            `,
        [tradesid, accountid]
      );
      await pool.query(deleteEntryQuery);
      await pool.end();
      return NextResponse.json(
        { tradesid },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json("Error deleting entry: ", {
        status: 400,
      });
    }
  }
}
