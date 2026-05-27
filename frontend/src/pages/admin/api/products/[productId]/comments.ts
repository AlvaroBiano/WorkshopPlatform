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
      sql: `SELECT c.*, u.full_name FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.product_id = ? AND c.parent_id IS NULL
            ORDER BY c.created_at DESC`,
      args: [productId],
    })

    return new Response(JSON.stringify({ comments: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar comentários' }), { status: 500 })
  }
}
