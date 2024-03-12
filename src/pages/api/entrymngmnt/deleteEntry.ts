import { NextFetchEvent, NextRequest } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import { deleteEntrySchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { tradesid, accountid } = deleteEntrySchema.parse(body);
      console.log("body: ", body);
      console.log("tradesID: ", tradesid);
      console.log("accountID: ", accountid);
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      const deleteEntryQuery = sqlstring.format(
        `
            DELETE FROM tableTrades WHERE tradesid = ? and accountid = ?
          `,
        [tradesid, accountid]
      );
      await pool.query(deleteEntryQuery);
      event.waitUntil(pool.end());
      console.log("sql: ", deleteEntryQuery);
      console.log("Entry deleted: ", tradesid);
      return new Response(JSON.stringify({ tradesid }), {
        status: 200,
      });
    } catch (error) {
      console.error("Issue deleting entry: ", error);
      return new Response("Error deleting entry: ", {
        status: 400,
      });
    }
  }
  return new Response("Method not allowed", {
    status: 405,
  });
}
