import { NextRequest, NextResponse } from "next/server";
import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";
import { extractBody } from "@/utils/extractBody";
import {
  deleteAccountSchema,
  newAccountSchema,
} from "@/utils/protection/schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  if (req.method === "POST") {
    try {
      const body = await extractBody(req);
      const { accountname, userid } = newAccountSchema.parse(body);
      const SQLstatement = sqlstring.format(
        `
              INSERT INTO tableAccounts (accountname, userid) VALUES (?, ?);
            `,
        [accountname, userid]
      );
      await pool.query(SQLstatement);
      await pool.end();
      return NextResponse.json(
        { accountname, userid },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json("Server error", {
        status: 500,
      });
    }
  } else if (req.method === "PUT") {
    try {
      const body = await extractBody(req);
      const { edits, accountname } = body;
      const sqlQuery = sqlstring.format(
        "UPDATE tableAccounts SET accountname = ? WHERE accountname = ?",
        [edits, accountname]
      );
      await pool.query(sqlQuery);
      await pool.end();
      return NextResponse.json("successful account update", { status: 200 });
    } catch (error) {
      return NextResponse.json("Bad Request", {
        status: 400,
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const body = await extractBody(req);
      const { accountname } = deleteAccountSchema.parse(body);
      const getAcctID = sqlstring.format(`
          select accountid from tableAccounts where accountname = '${accountname}'
        `);
      const placeholder = await pool.query(getAcctID);
      const accountID = placeholder.rows[0].accountid;
      const deleteAccountQuery = sqlstring.format(`
          DELETE FROM tableAccounts WHERE accountid = ${accountID}
        `);
      const deleteFrmTradeTbl = sqlstring.format(`
          delete from tableTrades where accountid = ${accountID}
        `);
      await pool.query(deleteFrmTradeTbl);
      await pool.query(deleteAccountQuery);
      await pool.end();
      return NextResponse.json({ accountname }, { status: 200 });
    } catch (error) {
      return NextResponse.json("Error deleting account", {
        status: 400,
      });
    }
  }
  return NextResponse.json("Method not allowed", {
    status: 405,
  });
}
