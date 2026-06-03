import type { APIRoute } from 'astro'
import { db, slugify, generateId, logAudit } from '../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const productsResult = await db.execute(`
      SELECT
        p.*,
        (SELECT COUNT(DISTINCT m.id) FROM modules m WHERE m.product_id = p.id) as modules_count,
        (SELECT COUNT(DISTINCT l.id) FROM lessons l
          INNER JOIN modules m ON l.module_id = m.id WHERE m.product_id = p.id) as lessons_count,
        (SELECT COUNT(DISTINCT pa.user_id) FROM product_access pa WHERE pa.product_id = p.id) as students_count
      FROM products p
      ORDER BY p.created_at DESC
    `)

    return new Response(JSON.stringify({
      products: productsResult.rows,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar produtos' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const body = await request.json()
    const title = (body.title || '').toString().trim()
    const description = body.description ? body.description.toString().trim() : ''
    const price_cents = parseInt(body.price_cents) || 0
    const type = (body.type || 'course').toString()
    const status = (body.status || 'draft').toString()
    const cover_url = body.cover_url ? body.cover_url.toString().trim() : ''
    const is_affiliable = body.is_affiliable !== undefined ? Boolean(body.is_affiliable) : false
    const affiliate_commission_pct = parseFloat(body.affiliate_commission_pct) || 40

    if (!title) {
      return new Response(JSON.stringify({ error: 'Título é obrigatório' }), { status: 400 })
    }

    if (!['workshop', 'course', 'ebook'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Tipo inválido' }), { status: 400 })
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Status inválido' }), { status: 400 })
    }

    const id = generateId()
    const slug = slugify(title)

    await db.execute({
      sql: `INSERT INTO products
            (id, title, slug, description, cover_url, price_cents, type, status, is_affiliable, affiliate_commission_pct, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        id,
        title,
        slug,
        description,
        cover_url,
        price_cents,
        type,
        status,
        is_affiliable ? 1 : 0,
        affiliate_commission_pct,
        status === 'published' ? 1 : 0,
      ],
    })

    const newProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    await logAudit(
      session.profile.id,
      'CREATE_PRODUCT',
      'products',
      id,
      { title, slug },
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    return new Response(JSON.stringify({
      success: true,
      product: newProduct.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar produto' }), { status: 500 })
  }
}
