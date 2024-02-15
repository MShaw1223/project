import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";

async function undoKey(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authKey = await req.body;
    console.log("authkey: ", authKey);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const sqlquery = sqlstring.format(
      `
            SELECT username from tableUsers where authkey = ?
            `,
      [authKey]
    );
    console.log(sqlquery);
    const indb = await pool.query(sqlquery);

    const username = await indb.rows[0].username;
    console.log("userFromHash: ", username);
    await pool.end();

    res.status(200).json({ loggedIn: username });
  } catch (error) {
    console.error("Error processing request: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    undoKey(req, res);
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
