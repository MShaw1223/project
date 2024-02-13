import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { comparePasswords } from "../comparePwd";

type siginCredentials = {
  passwd: string;
  username: string;
};

export async function signinFunc(input: siginCredentials) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const sqlquery = sqlstring.format(
      `
      SELECT passwd from tableUsers where username = (?)
      `,
      [input.username]
    );

    const indb = await pool.query(sqlquery);

    await pool.end();

    const password = input.passwd;
    const dbPassword = indb.rows[0].passwd;
    const isMatch = await comparePasswords(password, dbPassword);

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
