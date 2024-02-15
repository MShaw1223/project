import comparePasswords from "@/utils/comparePwd";
import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";

export const config = {
  runtime: "edge",
};

async function loginHandler(req: NextApiRequest) {
  const username = req.body.username;
  console.log("username: ", username);
  const passwd = req.body.passwd;
  console.log("password: ", passwd);

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
  console.log("Entered pwd: ", password);
  const dbPassword = indb.rows[0].passwd;
  console.log("db pwd: ", dbPassword);
  const isMatch = comparePasswords(password, dbPassword);

  if (isMatch === true) {
    console.log("successful");
    return new Response("Success", {
      status: 200,
    });
  }
  throw new Error("Wrong method");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return loginHandler(req);
  }
  return new Response("Failed to sign in, Invalid Method", {
    status: 405,
  });
}
