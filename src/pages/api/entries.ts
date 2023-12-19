// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

//this page for main db table?

import type { NextFetchEvent, NextRequest } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import zod, { number, string } from 'zod';
import sqlstring from 'sqlstring';
import { extractBody } from '@/utils/extractBody';

export const config = {
  runtime: 'edge',
};


const schema = zod.object({
  handle: number().max(20).min(1),
})

async function createPageHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  
  const {handle} = schema.parse(body);

  console.log('body', body)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  //change the name of the table --> table(field)
  //add to the handle array?
  const sql = sqlstring.format(`
    INSERT INTO accounta (trade_details)
    VALUES (
      ROW(
        ?, ?, ?
      )
    );  
  `,[handle])
  //[entryPrice, stopLoss, takeProfit] --> this wont work :
  // - work backwards find how to change handle / change handle const
  // to an object of ep, sl, tp
  // - change all instances with handle
  console.log("sql", sql)

  await pool.query(sql)
  
  event.waitUntil(pool.end());
  
  return new Response(JSON.stringify({ handle }),{
    status: 200
  });
}

export default async function handler(req: NextRequest, event: NextFetchEvent) {
  if(req.method === 'POST'){
    return createPageHandler(req, event)
  }
  return new Response("Invalid Method",{
    status: 405
  });
}
