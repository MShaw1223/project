import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";
import sqlstring from "sqlstring";
 //retrieval(variable){
// etc etc 
//  }
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const getTradesInfo = sqlstring.format(
    `
    from tableTrades select (tradesid, entryprice,	stoploss,	takeprofit,	tradenotes,	riskratio,	winloss)
    where tradesid = ${loggedIn} AND where accountID = ${selectedAccount}
    `
);

const 

export default async function retreival () {
    
}

// db query would return stuff under: 
// tradesid	accountid	userid	