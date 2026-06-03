import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const result = await db.execute(`
      SELECT pr.*, p.title as desired_product_title, p.price_cents as desired_product_price
      FROM pending_registrations pr
      LEFT JOIN products p ON p.id = pr.desired_product_id
      ORDER BY pr.created_at DESC
    `)

    return new Response(JSON.stringify({
      pending: result.rows,
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error fetching pending registrations:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar pendentes' }), { status: 500 })
  }
}
