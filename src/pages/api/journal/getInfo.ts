// import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
import { useRouter } from "next/router";
//retrieval(variable){
// etc etc
//  }
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


//const { li } = router.query;
// const loggedIn = li; 
// where tradesid = ${loggedIn} AND

export default async function retreival(selectedAccount: any) {
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
      return lgdin;
    }catch(error){
      console.error("Error fetching user: ", error);
    }
  }
  try {
    const ID = await fetch("", {
      method: "POST",
      body: lgdin,
      headers: {"Content-Type": "application/json"}
    })
  } catch (error) {
    console.error("Error fetching ID: ", error);
  }
  try {
    const getTradesInfo = sqlstring.format(
      `
        from tableTrades select (tradesid, entryprice,	stoploss,	takeprofit,	tradenotes,	riskratio,	winloss)
        where accountID = (?)
        `,
      selectedAccount
    );

    return getTradesInfo;
  } catch (error) {
    return new Response("Issue in retrieval", {
      status: 405,
    });
  }
}

// db query would return stuff under:
// tradesid	accountid	userid
