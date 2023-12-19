import { extractBody } from "@/utils/extractBody";
import { NextFetchEvent, NextRequest } from "next/server";
import zod, { string, z } from 'zod';
import {v4 as uuidv4} from 'uuid';
import sqlstring from 'sqlstring';
import { Pool } from "@neondatabase/serverless";

//this would be for SELECT to show the data has actually been entered to the db

export const config = {
    runtime: 'edge'
}
const createCommentSchema = zod.object({
    page: z.string().max(100).min(1),
    comment: z.string().max(256),
})

async function createCommentHandler(req: NextRequest, event: NextFetchEvent) {
    const body = await extractBody(req);

    const {comment, page} = createCommentSchema.parse(body);

    const id = uuidv4()
    const createCommentQuery = sqlstring.format(`
    INSERT INTO comment (id, page, comment) values(?, ?, ?)`, 
    [id, page, comment]); //other table

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    }) //can create a utility for this ie called poolCreate.ts --> see extractBody.ts
    try {
        await pool.query(createCommentQuery)
        return new Response(JSON.stringify({ id })); 
    } catch (e) {
        console.error(e)
        return new Response("Page not found", {
        status: 404,
        })
    }finally{
        event.waitUntil(pool.end())
    }
}

async function readCommentHandler(req: NextRequest, event: NextFetchEvent) {
    const {searchParams} = new URL(req.url)

    const page = searchParams.get('page')

    if(!page){
        return new Response('page not found', {
            status: 404,
        });
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })

    const getCommentsQuery = sqlstring.format(`
    SELECT id, comment, created_at
    FROM comment
    WHERE page = ?
    ORDER BY created_at DESC;
    `,
        [page]
    )
    
    try {
        const {rows: commentRows} = await pool.query(getCommentsQuery)
        return new Response(JSON.stringify(commentRows))
    } catch (e) {
        console.error(e)
        return new Response("Page not found",{
            status: 404,
        })
    }finally{
        event.waitUntil(pool.end());
    }
}

async function handler(req: NextRequest, event: NextFetchEvent){
    if(req.method === 'POST'){
        return createCommentHandler(req, event)
    }
    if(req.method === 'GET'){
        return readCommentHandler(req, event)
    }
    return new Response("Invalid method", {
        status: 405,
    })
}

export default handler;