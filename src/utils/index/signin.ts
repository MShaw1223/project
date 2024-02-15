import comparePasswords from "@/utils/comparePwd";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

export async function signinFunc(username: string, passwd: string) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const sqlquery = sqlstring.format(
      `
      SELECT passwd from tableUsers where username = (?)
      `,
      [username]
    );

    const indb = await pool.query(sqlquery);

    await pool.end();

    const password = passwd;
    const dbPassword = indb.rows[0].passwd;
    console.log("db pwd: ", dbPassword);
    const isMatch = comparePasswords(password, dbPassword);

    if (isMatch === true) {
      return true;
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    console.error("Failed to validate, error: ", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
