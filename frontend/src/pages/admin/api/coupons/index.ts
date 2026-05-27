import type { APIRoute } from 'astro'
import { db } from '../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const result = await db.execute(`
      SELECT c.*, p.title as product_name,
        (SELECT COUNT(*) FROM orders WHERE coupon_id = c.id) as used_count
      FROM coupons c
      LEFT JOIN products p ON c.product_id = p.id
      ORDER BY c.created_at DESC
    `)

    return new Response(JSON.stringify({ coupons: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar cupons' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { code, description, discount_type, discount_value, max_uses, product_id } = await request.json()

    if (!code || !discount_value) {
      return new Response(JSON.stringify({ error: 'Código e valor são obrigatórios' }), { status: 400 })
    }

    const id = crypto.randomUUID()
    await db.execute({
      sql: `INSERT INTO coupons (id, code, description, discount_type, discount_value, max_uses, product_id, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [id, code.toUpperCase(), description || null, discount_type, discount_value, max_uses || null, product_id || null],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao criar cupom' }), { status: 500 })
  }
}
