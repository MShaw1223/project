import { Pool } from "@neondatabase/serverless";
import { NextApiRequest } from "next";
import { NextFetchEvent } from "next/server";

export default async function editEntryHandler(
  req: NextApiRequest,
  event: NextFetchEvent
) {
  const pool = new Pool();
}
