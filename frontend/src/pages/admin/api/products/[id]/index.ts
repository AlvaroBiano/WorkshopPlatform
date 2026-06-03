import type { APIRoute } from 'astro'
import { db, slugify, generateId, logAudit } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const GET: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400 })
  }

  try {
    const productResult = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const modulesResult = await db.execute({
      sql: `SELECT * FROM modules WHERE product_id = ? ORDER BY sort_order ASC`,
      args: [id],
    })

    const lessonsResult = modulesResult.rows.length > 0
      ? await db.execute({
          sql: `SELECT * FROM lessons WHERE module_id IN (${modulesResult.rows.map(() => '?').join(',')}) ORDER BY sort_order ASC`,
          args: modulesResult.rows.map((m: any) => m.id),
        })
      : { rows: [] }

    const product = productResult.rows[0] as any
    product.modules = modulesResult.rows.map((module: any) => ({
      ...module,
      lessons: lessonsResult.rows.filter((l: any) => l.module_id === module.id),
    }))

    return new Response(JSON.stringify({ product }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar produto' }), { status: 500 })
  }
}

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400 })
  }

  try {
    const body = await request.json()
    const title = body.title !== undefined ? body.title.toString().trim() : undefined
    const description = body.description !== undefined ? body.description.toString().trim() : undefined
    const price_cents = body.price_cents !== undefined ? parseInt(body.price_cents) : undefined
    const type = body.type !== undefined ? body.type.toString() : undefined
    const status = body.status !== undefined ? body.status.toString() : undefined
    const cover_url = body.cover_url !== undefined ? body.cover_url.toString().trim() : undefined
    const is_affiliable = body.is_affiliable !== undefined ? Boolean(body.is_affiliable) : undefined
    const affiliate_commission_pct = body.affiliate_commission_pct !== undefined ? parseFloat(body.affiliate_commission_pct) : undefined

    const existing = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const updates: string[] = []
    const args: any[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      args.push(title)
      updates.push('slug = ?')
      args.push(slugify(title))
    }
    if (description !== undefined) {
      updates.push('description = ?')
      args.push(description || '')
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
      if (status === 'published') {
        updates.push('is_published = 1')
      } else if (status === 'draft' || status === 'archived') {
        updates.push('is_published = 0')
      }
    }
    if (cover_url !== undefined) {
      updates.push('cover_url = ?')
      args.push(cover_url || '')
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
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), { status: 400 })
    }

    updates.push("updated_at = datetime('now')")
    args.push(id)

    await db.execute({
      sql: `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await logAudit(
      session.profile.id,
      'UPDATE_PRODUCT',
      'products',
      id,
      { title, description, price_cents, status },
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    const updated = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      product: updated.rows[0],
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error updating product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar produto' }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400 })
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [id],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] })

    await logAudit(
      session.profile.id,
      'DELETE_PRODUCT',
      'products',
      id,
      undefined,
      ''
    )

    return new Response(JSON.stringify({
      success: true,
      message: 'Produto removido com sucesso',
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error deleting product:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover produto' }), { status: 500 })
  }
}
