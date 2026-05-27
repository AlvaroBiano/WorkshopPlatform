import type { APIRoute } from 'astro'
import { db } from '../../lib/turso'

export const GET: APIRoute = async () => {
  try {
    const result = await db.execute('SELECT * FROM users LIMIT 1')
    return new Response(JSON.stringify({ 
      success: true, 
      count: result.rows.length,
      user: result.rows[0] 
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Test error:', err)
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
