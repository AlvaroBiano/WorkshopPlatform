import type { APIRoute } from 'astro'
import { db, slugify, generateId } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId } = params
  if (!productId) {
    return new Response(JSON.stringify({ error: 'Product ID é obrigatório' }), { status: 400 })
  }

  try {
    const body = await request.json()
    const title = (body.title || '').toString().trim()
    const description = body.description ? body.description.toString().trim() : ''
    const sort_order = body.sort_order !== undefined ? parseInt(body.sort_order) : undefined

    if (!title) {
      return new Response(JSON.stringify({ error: 'Título é obrigatório' }), { status: 400 })
    }

    const product = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [productId],
    })

    if (product.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const id = generateId()

    const maxOrder = await db.execute({
      sql: 'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM modules WHERE product_id = ?',
      args: [productId],
    })
    const finalOrder = sort_order !== undefined ? sort_order : (Number((maxOrder.rows[0] as any)?.max_order || 0) + 1)

    await db.execute({
      sql: `INSERT INTO modules (id, product_id, title, slug, description, sort_order, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [id, productId, title, slugify(title), description || null, finalOrder],
    })

    const newModule = await db.execute({
      sql: 'SELECT * FROM modules WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'CREATE_MODULE', 'modules', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        id,
        JSON.stringify({ title, product_id: productId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      module: newModule.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating module:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar módulo' }), { status: 500 })
  }
}
