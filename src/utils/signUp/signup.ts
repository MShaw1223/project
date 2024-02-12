import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { hashPassword } from "../protection/encryptUtils";

type signupCredentials = {
  passwd: string;
  username: string;
};

export async function signupFunc(input: signupCredentials) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const unhashed = input.passwd;
    console.log("pwd", unhashed);
    const hashed = await hashPassword(unhashed);

    const sqlquery = sqlstring.format(
      `
        INSERT INTO tableUsers (username, passwd) VALUES (?,?)
        `,
      [input.username, hashed]
    );

    const submitted = await pool.query(sqlquery);

    await pool.end();

    if (submitted.rowCount > 0) {
      return true;
    } else {
      throw new Error("Error submitting details to database");
    }
  } catch (error) {
    console.error("Failed to sign up, error: ", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
