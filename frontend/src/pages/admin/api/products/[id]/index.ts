import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

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
    const productResult = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const modulesResult = await db.execute({
      sql: `
        SELECT m.*, COUNT(l.id) as lessons_count
        FROM modules m
        LEFT JOIN lessons l ON m.id = l.module_id
        WHERE m.product_id = ?
        GROUP BY m.id
        ORDER BY m.sort_order ASC
      `,
      args: [id],
    })

    const lessonsResult = await db.execute({
      sql: `
        SELECT l.*, m.id as module_id
        FROM lessons l
        INNER JOIN modules m ON l.module_id = m.id
        WHERE m.product_id = ?
        ORDER BY l.sort_order ASC
      `,
      args: [id],
    })

    const product = productResult.rows[0] as any
    product.modules = modulesResult.rows.map((module: any) => ({
      ...module,
      lessons: lessonsResult.rows.filter((lesson: any) => lesson.module_id === module.id),
    }))

    return new Response(JSON.stringify({ product }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar produto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const PUT: APIRoute = async ({ request, cookies, params }) => {
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
    const {
      title,
      description,
      price_cents,
      type,
      status,
      cover_url,
      is_affiliable,
      affiliate_commission_pct,
    } = await request.json()

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

    const updates: string[] = []
    const args: any[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      args.push(title)
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      updates.push('slug = ?')
      args.push(slug)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      args.push(description)
    }
    if (price_cents !== undefined) {
      updates.push('price_cents = ?')
      args.push(price_cents)
    }
    if (type !== undefined) {
      updates.push('type = ?')
      args.push(type)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      args.push(status)
    }
    if (cover_url !== undefined) {
      updates.push('cover_url = ?')
      args.push(cover_url)
    }
    if (is_affiliable !== undefined) {
      updates.push('is_affiliable = ?')
      args.push(is_affiliable ? 1 : 0)
    }
    if (affiliate_commission_pct !== undefined) {
      updates.push('affiliate_commission_pct = ?')
      args.push(affiliate_commission_pct)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    updates.push("updated_at = datetime('now')")
    args.push(id)

    await db.execute({
      sql: `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UPDATE_PRODUCT', 'products', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ title, description, price_cents, status }),
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
    console.error('Error updating product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar produto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
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
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'DELETE_PRODUCT', 'products', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({}),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Produto removido com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover produto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
