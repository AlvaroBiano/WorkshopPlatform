import type { APIRoute } from 'astro'
import { db } from '../../../../lib/turso'
import { getSessionFromCookies } from '../../../../lib/auth'

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params
  
  try {
    const productResult = await db.execute({
      sql: 'SELECT id FROM products WHERE slug = ?',
      args: [slug],
    })

    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const productId = (productResult.rows[0] as any).id

    const reviewsResult = await db.execute({
      sql: `SELECT r.*, u.full_name FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC`,
      args: [productId],
    })

    return new Response(JSON.stringify({ reviews: reviewsResult.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar avaliações' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { slug } = params
    const productResult = await db.execute({
      sql: 'SELECT id FROM products WHERE slug = ?',
      args: [slug],
    })

    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const productId = (productResult.rows[0] as any).id
    const { rating, title, body } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Avaliação deve ser entre 1 e 5 estrelas' }), { status: 400 })
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      args: [productId, session.profile.id],
    })

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE reviews SET rating = ?, title = ?, body = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [rating, title || null, body || null, (existing.rows[0] as any).id],
      })
    } else {
      await db.execute({
        sql: `INSERT INTO reviews (id, product_id, user_id, rating, title, body, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [crypto.randomUUID(), productId, session.profile.id, rating, title || null, body || null],
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao salvar avaliação' }), { status: 500 })
  }
}
