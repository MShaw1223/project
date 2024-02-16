import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";

async function getAcc(req: NextApiRequest, res: NextApiResponse) {
  try {
    const selected = await req.body;
    console.log("Selected Account: ", selected);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const sqlquery = sqlstring.format(
      `
            SELECT accountID from tableAccount where accountname = ?
            `,
      [selected]
    );
    console.log(sqlquery);
    const indb = await pool.query(sqlquery);
    const accID = await indb.rows[0].accountID;
    console.log("account ID: ", accID);
    await pool.end();

    res.status(200).json({ accountID: accID });
  } catch (error) {
    console.error("Error processing request: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    getAcc(req, res);
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
