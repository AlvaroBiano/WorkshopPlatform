import type { APIRoute } from 'astro'
import { db } from '../../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId } = params
  if (!productId || !moduleId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { lesson_ids } = await request.json()

    if (!Array.isArray(lesson_ids)) {
      return new Response(JSON.stringify({ error: 'lesson_ids deve ser um array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (let i = 0; i < lesson_ids.length; i++) {
      await db.execute({
        sql: 'UPDATE lessons SET sort_order = ? WHERE id = ? AND module_id = ?',
        args: [i + 1, lesson_ids[i], moduleId],
      })
    }

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'REORDER_LESSONS', 'lessons', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        moduleId,
        JSON.stringify({ lesson_ids }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Aulas reordenadas com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error reordering lessons:', error)
    return new Response(JSON.stringify({ error: 'Erro ao reordenar aulas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
