import type { APIRoute } from 'astro'
import { db, slugify, generateId } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId } = params
  if (!productId || !moduleId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), { status: 400 })
  }

  try {
    const body = await request.json()
    const title = body.title !== undefined ? body.title.toString().trim() : undefined
    const description = body.description !== undefined ? body.description.toString().trim() : undefined
    const sort_order = body.sort_order !== undefined ? parseInt(body.sort_order) : undefined

    const existing = await db.execute({
      sql: 'SELECT * FROM modules WHERE id = ? AND product_id = ?',
      args: [moduleId, productId],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Módulo não encontrado' }), { status: 404 })
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
      args.push(description || null)
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      args.push(sort_order)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), { status: 400 })
    }

    args.push(moduleId)
    await db.execute({
      sql: `UPDATE modules SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'UPDATE_MODULE', 'modules', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        moduleId,
        JSON.stringify({ title, sort_order, product_id: productId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updated = await db.execute({
      sql: 'SELECT * FROM modules WHERE id = ?',
      args: [moduleId],
    })

    return new Response(JSON.stringify({
      success: true,
      module: updated.rows[0],
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error updating module:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar módulo' }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId } = params
  if (!productId || !moduleId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), { status: 400 })
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM modules WHERE id = ? AND product_id = ?',
      args: [moduleId, productId],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Módulo não encontrado' }), { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM modules WHERE id = ?', args: [moduleId] })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'DELETE_MODULE', 'modules', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        moduleId,
        JSON.stringify({ product_id: productId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Módulo removido com sucesso',
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error deleting module:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover módulo' }), { status: 500 })
  }
}
