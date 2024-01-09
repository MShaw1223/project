import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";

//this would be for SELECT and insert
// change the insert to delete

export const config = {
  runtime: "edge",
};

async function readCommentHandler(req: NextRequest, event: NextFetchEvent) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const getInfo = sqlstring.format(
    `
    SELECT id, comment, created_at
    FROM comment
    WHERE page = 
    ORDER BY created_at DESC;
    `
  ); //edit this sql statement to search the current user, through all accounts and find any data needed in the table

  try {
    const { rows: commentRows } = await pool.query(getInfo);
    return new Response(JSON.stringify(commentRows));
  } catch (e) {
    console.error(e);
    return new Response("Page not found", {
      status: 404,
    });
  } finally {
    event.waitUntil(pool.end());
  } //this could work v/ v/ nice?
}

async function handler(req: NextRequest, event: NextFetchEvent) {
  if (req.method === "GET") {
    return readCommentHandler(req, event);
  }
  return new Response("Invalid method", {
    status: 405,
  });
}

export default handler;
