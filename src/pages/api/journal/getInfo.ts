// import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { useRouter } from "next/router";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function retreival() {
  const router = useRouter();
  const { li } = router.query;
  console.log(li);
  if (li !== undefined) {
    try {
      const user = await fetch("/api/auth/userFromHash", {
        method: "POST",
        body: JSON.stringify(li),
        headers: { "Content-Type": "application/json" },
      });
      const lgdin = await user.json();
      console.log("User logged in: ", lgdin);
      const getIDquery = sqlstring.format(
        `
        SELECT userID from tableusers where username = ?
      `,
        [lgdin]
      );
      const ID = await pool.query(getIDquery);
      const getTradesInfo = sqlstring.format(
        `
        SELECT (tradesid, entryprice,	stoploss,	takeprofit,	tradenotes,	riskratio,	winloss) from tableTrades
        where accountID = (?)
        `,
        [ID]
      );
      const result = await pool.query(getTradesInfo);
      await pool.end();
      return new Response(JSON.stringify(result), {
        status: 200,
      });
    } catch (error) {
      return new Response("Issue finding ID", {
        status: 400,
      });
    }
  }
}

// db query would return stuff under:
// tradesid	accountid	userid
