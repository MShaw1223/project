import { NextFetchEvent, NextRequest } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import zod from "zod";
import { deleteEntrySchema } from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

async function deleteEntryHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  const { tradesid } = deleteEntrySchema.parse(body);
  console.log("body", body);
  console.log("tradesID", tradesid);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const deleteEntryQuery = sqlstring.format(
    `
        DELETE FROM tableTrades WHERE tradesid = (?)
      `,
    [tradesid]
  );

  console.log("sql", deleteEntryQuery);

  await pool.query(deleteEntryQuery);

  event.waitUntil(pool.end());

  console.log("Entry deleted:", tradesid);

  return new Response(JSON.stringify({ tradesid }), {
    status: 200,
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "DELETE") {
    return deleteEntryHandler(req, event);
  }
  return new Response("Method not allowed", {
    status: 405,
  });
}
