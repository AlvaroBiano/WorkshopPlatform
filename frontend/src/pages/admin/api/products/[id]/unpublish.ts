import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
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
    const existingProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    if (existingProduct.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: `UPDATE products SET status = 'draft', updated_at = datetime('now') WHERE id = ?`,
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UNPUBLISH_PRODUCT', 'products', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({}),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      product: updatedProduct.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error unpublishing product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao despublicar produto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
