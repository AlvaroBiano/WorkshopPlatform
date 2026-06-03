import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const orderResult = await db.execute({
      sql: `
        SELECT 
          o.*,
          u.full_name as user_name,
          u.email as user_email,
          u.whatsapp as user_whatsapp,
          p.title as product_title,
          p.price_cents as product_price
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN products p ON o.product_id = p.id
        WHERE o.id = ?
      `,
      args: [id],
    })

    if (orderResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      order: orderResult.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar pedido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
