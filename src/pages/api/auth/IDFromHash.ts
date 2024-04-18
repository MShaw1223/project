import { Pool } from "@neondatabase/serverless";
import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //checks if http method is correct
  if (req.method === "POST") {
    try {
      const authKey = await req.body;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      // then gets ID from the DB with the same authKey
      const sqlquery = "SELECT userid from tableUsers where authkey = ?";
      const indb = await pool.query(sqlstring.format(sqlquery, [authKey]));
      const userID: number = await indb.rows[0].userid;
      await pool.end();
      // returns a success response with userID in json
      res.status(200).json(userID);
    } catch (error) {
      // if no authkey there is an error thrown (bad request)
      res.status(400).json({ error: "Bad request" });
    }
  } else {
    // if incorrect http method error thrown
    res.status(405).json({ error: "Method Not allowed" });
  }
}
