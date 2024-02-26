import type { NextFetchEvent, NextRequest } from "next/server";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { extractBody } from "@/utils/extractBody";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "PUT") {
    try {
      const body = await extractBody(req);
      const field = body.fieldToChange;
      const tradesid = body.tradeid;
      const editedData = body.editedData;
      console.log("body: ", body);
      console.log("field: ", field);
      console.log("tradesid: ", tradesid);
      console.log("editedData: ", editedData);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const SQLstatement = sqlstring.format(
        `
            UPDATE tableTrades SET ${field} = ? WHERE tradeid = ?;
        `,
        [editedData, tradesid]
      );
      await pool.query(SQLstatement);
      event.waitUntil(pool.end());
      console.log("SQLstatement", SQLstatement);
      return new Response(JSON.stringify({ tradesid, field, editedData }), {
        status: 200,
      });
    } catch (error) {
      console.error("Unable to update entry");
      return new Response("Unable to update", {
        status: 400,
      });
    }
  } else {
    return new Response("Invalid Method", {
      status: 405,
    });
  }
}
