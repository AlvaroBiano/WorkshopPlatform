import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
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
        COUNT(DISTINCT m.id) as modules_count,
        COUNT(DISTINCT l.id) as lessons_count,
        COUNT(DISTINCT pa.user_id) as students_count
      FROM products p
      LEFT JOIN modules m ON p.id = m.product_id
      LEFT JOIN lessons l ON m.id = l.module_id
      LEFT JOIN product_access pa ON p.id = pa.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `)

    return new Response(JSON.stringify({
      products: productsResult.rows,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar produtos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const {
      title,
      description,
      price_cents,
      type = 'course',
      status = 'draft',
      cover_url,
      is_affiliable = false,
      affiliate_commission_pct = 40,
    } = await request.json()

    if (!title) {
      return new Response(JSON.stringify({ error: 'Título é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = crypto.randomUUID()
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    await db.execute({
      sql: `
        INSERT INTO products (
          id, title, slug, description, price_cents, type, status, 
          cover_url, is_affiliable, affiliate_commission_pct, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
      args: [
        id,
        title,
        slug,
        description || '',
        price_cents || 0,
        type,
        status,
        cover_url || '',
        is_affiliable ? 1 : 0,
        affiliate_commission_pct,
      ],
    })

    const newProduct = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'CREATE_PRODUCT', 'products', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ title, slug }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      product: newProduct.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar produto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
