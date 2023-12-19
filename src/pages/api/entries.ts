// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

//this page for main db table?

import type { NextFetchEvent, NextRequest } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import zod, { number } from 'zod';
import sqlstring from 'sqlstring';
import { extractBody } from '@/utils/extractBody';

export const config = {
  runtime: 'edge',
};

const schema = zod.object({
  entryPrice: number().max(9999999.9999999).min(0.0000001), 
  stopLoss: number().max(9999999.9999999).min(0.0000001),
  takeProfit: number().max(9999999.9999999).min(0.0000001),
  selectedAccount: zod.string(),
})

async function createPageHandler(req: NextRequest, event: NextFetchEvent) {
  const body = await extractBody(req);
  
  const {entryPrice, stopLoss, takeProfit, selectedAccount} = schema.parse(body);

  console.log('body', body)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  let tradesTable, accountTable;

  switch (selectedAccount) {
      case 'accountNumberOne':
          tradesTable = 'tradesaccounta';
          accountTable = 'accounta';
          break;
      case 'accountNumberTwo':
          tradesTable = 'tradesaccountb';
          accountTable = 'accountb';
          break;
      case 'accountNumberThree':
          tradesTable = 'tradesaccountc';
          accountTable = 'accountc';
          break;
      // Add more cases for additional accounts if needed

      default:
          throw new Error('Invalid selected account');
  }

  const tradesAccountASql = sqlstring.format(`
      INSERT INTO ${tradesTable} (details)
      VALUES (
          ROW(?, ?, ?)
      );
  `, [entryPrice, stopLoss, takeProfit]);

  const accountASql = sqlstring.format(`
      INSERT INTO ${accountTable} (id${accountTable.toLowerCase()})
      VALUES (
          (SELECT id${accountTable.toLowerCase()} FROM ${tradesTable} LIMIT 1)
      );
  `);

  console.log("tradesAccountASql", tradesAccountASql);
  console.log("accountASql", accountASql);

  await pool.query(tradesAccountASql);

  await pool.query(accountASql);

  event.waitUntil(pool.end());
  
  const responsePayload = {
    entryPrice, 
    stopLoss, 
    takeProfit
  };

  return new Response(JSON.stringify({ responsePayload }),{
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
