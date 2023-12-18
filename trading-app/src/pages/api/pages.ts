// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextFetchEvent, NextRequest } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

async function extractBody(req: NextRequest) {
  if(!req.body){
    return null;
  }

  const decoder = new TextDecoder();

  const reader = req.body.getReader();

  let body = "";

  while(true){
    const {done, value} = await reader.read();
    if(done){
      try{
        return JSON.parse(body)
      }catch(e){
        console.error(e)
        return null
      };
    }
    body = body + decoder.decode(value)

  }

}

async function createPageHandler(req: NextRequest, event: NextFetchEvent) {
  const body = req.body
  
  console.log('body', body)

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  const sql = 'SELECT NOW()'
  
  const {rows} = await pool.query(sql)
  
  const now = rows[0]
  
  event.waitUntil(pool.end());
  
  return new Response(JSON.stringify({ now }),{
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
