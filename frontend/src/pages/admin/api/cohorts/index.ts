import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const result = await db.execute(`
      SELECT c.*, p.title as product_title
      FROM cohorts c
      LEFT JOIN products p ON p.id = c.product_id
      ORDER BY c.created_at DESC
    `)

    return new Response(JSON.stringify({ cohorts: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
