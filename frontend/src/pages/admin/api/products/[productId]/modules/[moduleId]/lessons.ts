import type { APIRoute } from 'astro'
import { db } from '../../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
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
    const { title, video_url, duration_sec, sort_order } = await request.json()

    if (!title) {
      return new Response(JSON.stringify({ error: 'Título é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const module = await db.execute({
      sql: 'SELECT * FROM modules WHERE id = ? AND product_id = ?',
      args: [moduleId, productId],
    })

    if (module.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Módulo não encontrado' }), {
        status: 404,
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

    const maxOrder = await db.execute({
      sql: 'SELECT MAX(sort_order) as max_order FROM lessons WHERE module_id = ?',
      args: [moduleId],
    })

    const finalOrder = sort_order ?? ((maxOrder.rows[0] as any)?.max_order || 0) + 1

    await db.execute({
      sql: `
        INSERT INTO lessons (id, module_id, title, slug, video_url, duration_sec, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `,
      args: [id, moduleId, title, slug, video_url || '', duration_sec || 0, finalOrder],
    })

    const newLesson = await db.execute({
      sql: 'SELECT * FROM lessons WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'CREATE_LESSON', 'lessons', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ title, module_id: moduleId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      lesson: newLesson.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar aula' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
