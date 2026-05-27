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

    const commentsResult = await db.execute({
      sql: `SELECT c.*, u.full_name FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.product_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
            ORDER BY c.created_at DESC`,
      args: [productId],
    })

    return new Response(JSON.stringify({ comments: commentsResult.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar comentários' }), { status: 500 })
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
    const { body, parent_id } = await request.json()

    if (!body || body.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Comentário não pode estar vazio' }), { status: 400 })
    }

    await db.execute({
      sql: `INSERT INTO comments (id, product_id, user_id, parent_id, body, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [crypto.randomUUID(), productId, session.profile.id, parent_id || null, body.trim()],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao salvar comentário' }), { status: 500 })
  }
}
