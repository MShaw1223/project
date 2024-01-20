import { NextFetchEvent, NextRequest } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function deleteAccountHandler(req: NextRequest) {
  const accountname = await extractBody(req);

  const deleteAccountQuery = sqlstring.format(
    `
            DELETE FROM tableAccount WHERE accountname = ?
        `,
    [accountname]
  );
  await pool.query(deleteAccountQuery);
  console.log("Account deleted:", accountname);
}
