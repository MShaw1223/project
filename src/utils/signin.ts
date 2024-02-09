import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { comparePasswords } from "./bcryptUtils";

export async function signinFunc(credentials: {
  passwd: string;
  username: string;
}) {
  try {
    console.log("this works");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const sqlquery = sqlstring.format(
      `
      SELECT passwd from tableUsers where username = (?)
      `,
      [credentials.username]
    );

    const indb = await pool.query(sqlquery);

    await pool.end();

    const isMatch = await comparePasswords(
      credentials.passwd,
      indb.rows[0].passwd
    );

    if (isMatch) {
      return true;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
