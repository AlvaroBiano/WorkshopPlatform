import type { APIRoute } from 'astro'
import { db, generateId, logAudit } from '@lib/turso'
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
    const lesson_ids = body.lesson_ids

    if (!Array.isArray(lesson_ids)) {
      return new Response(JSON.stringify({ error: 'lesson_ids deve ser um array' }), { status: 400 })
    }

    for (let i = 0; i < lesson_ids.length; i++) {
      await db.execute({
        sql: `UPDATE lessons SET sort_order = ? WHERE id = ? AND module_id IN
              (SELECT id FROM modules WHERE id = ? AND product_id = ?)`,
        args: [i + 1, lesson_ids[i], moduleId, productId],
      })
    }

    await logAudit(
      session.profile.id,
      'REORDER_LESSONS',
      'lessons',
      moduleId,
      { order: lesson_ids },
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error reordering lessons:', error)
    return new Response(JSON.stringify({ error: 'Erro ao reordenar aulas' }), { status: 500 })
  }
}
