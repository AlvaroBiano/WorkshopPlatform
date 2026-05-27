import type { APIRoute } from 'astro'
import { db } from '../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId } = params
  if (!productId) {
    return new Response(JSON.stringify({ error: 'Product ID é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { module_ids } = await request.json()

    if (!Array.isArray(module_ids)) {
      return new Response(JSON.stringify({ error: 'module_ids deve ser um array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (let i = 0; i < module_ids.length; i++) {
      await db.execute({
        sql: 'UPDATE modules SET sort_order = ? WHERE id = ? AND product_id = ?',
        args: [i + 1, module_ids[i], productId],
      })
    }

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'REORDER_MODULES', 'modules', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        productId,
        JSON.stringify({ module_ids }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Módulos reordenados com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error reordering modules:', error)
    return new Response(JSON.stringify({ error: 'Erro ao reordenar módulos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
