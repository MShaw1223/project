import { extractBody } from "@/utils/extractBody";
import { Pool } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

export default async function FindPairID(req: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    const body = await extractBody(req);
    const { selectedPair, userID } = body;
    const SQLstatement = sqlstring.format(
      `
      SELECT pairid from tablepairs where pairabbr = ? and userid = ?
      `,
      [selectedPair, userID]
    );
    const placeholder = await pool.query(SQLstatement);
    const pairid = placeholder.rows[0].pairid;
    await pool.end();
    return NextResponse.json(
      { pairid },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json("Unable to find currency", {
      status: 400,
    });
  }
}
