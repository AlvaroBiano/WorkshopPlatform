import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies } from '@lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')

  try {
    let result
    if (slug) {
      result = await db.execute({
        sql: `SELECT r.*, u.full_name FROM reviews r
              INNER JOIN users u ON r.user_id = u.id
              INNER JOIN products p ON r.product_id = p.id
              WHERE p.slug = ? AND r.status = 'approved'
              ORDER BY r.created_at DESC`,
        args: [slug],
      })
    } else {
      result = await db.execute({
        sql: `SELECT r.*, u.full_name FROM reviews r
              INNER JOIN users u ON r.user_id = u.id
              WHERE r.status = 'approved'
              ORDER BY r.created_at DESC LIMIT 20`,
        args: [],
      })
    }

    return new Response(JSON.stringify({ reviews: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
