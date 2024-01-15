import { NextApiRequest, NextApiResponse } from "next";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function deleteAccountHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "DELETE") {
      res.status(405).json({ message: "Method Not Allowed" });
      return;
    }
    const accountname = req.body;

    const deleteAccountQuery = sqlstring.format(
      `
              DELETE FROM tableaccount WHERE accountname = ?
          `,
      [accountname]
    );
    await pool.query(deleteAccountQuery);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
