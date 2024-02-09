import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { hashPassword } from "./bcryptUtils";

export async function signupFunc(credentials: {
  passwd: string;
  username: string;
}) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const hashed = await hashPassword(credentials.passwd);
    const sqlquery = sqlstring.format(
      `
        INSERT INTO tableUsers (username, passwd) VALUES (?,?)
        `,
      [credentials.username, hashed]
    );
    const submitted = await pool.query(sqlquery);
    await pool.end();
    if (submitted) {
      return true;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
