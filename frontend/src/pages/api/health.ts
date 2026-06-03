import type { APIRoute } from 'astro'
import { db } from '@lib/turso'

export const GET: APIRoute = async () => {
  const start = Date.now()

  let dbOk = false
  let dbError = ''
  try {
    await db.execute('SELECT 1 as ok')
    dbOk = true
  } catch (e: any) {
    dbError = e?.message || 'unknown'
  }

  const responseTime = Date.now() - start

  return new Response(
    JSON.stringify({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime?.() || 0),
      response_time_ms: responseTime,
      database: {
        status: dbOk ? 'ok' : 'error',
        error: dbError || null,
      },
    }, null, 2),
    {
      status: dbOk ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  )
}
