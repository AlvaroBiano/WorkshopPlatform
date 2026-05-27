import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const GET: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId } = params

  try {
    const result = await db.execute({
      sql: `SELECT r.*, u.full_name, u.email FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      args: [productId],
    })

    return new Response(JSON.stringify({ reviews: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar avaliações' }), { status: 500 })
  }
}
