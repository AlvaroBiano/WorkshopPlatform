import type { APIRoute } from 'astro'
import { db } from '../../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId, lessonId } = params
  if (!productId || !moduleId || !lessonId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { title, video_url, duration_sec, sort_order } = await request.json()

    const existingLesson = await db.execute({
      sql: `
        SELECT l.* FROM lessons l
        INNER JOIN modules m ON l.module_id = m.id
        WHERE l.id = ? AND m.id = ? AND m.product_id = ?
      `,
      args: [lessonId, moduleId, productId],
    })

    if (existingLesson.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aula não encontrada' }), {
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

    if (video_url !== undefined) {
      updates.push('video_url = ?')
      args.push(video_url)
    }

    if (duration_sec !== undefined) {
      updates.push('duration_sec = ?')
      args.push(duration_sec)
    }

    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      args.push(sort_order)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    args.push(lessonId)

    await db.execute({
      sql: `UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UPDATE_LESSON', 'lessons', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        lessonId,
        JSON.stringify({ title, video_url, duration_sec, module_id: moduleId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedLesson = await db.execute({
      sql: 'SELECT * FROM lessons WHERE id = ?',
      args: [lessonId],
    })

    return new Response(JSON.stringify({
      success: true,
      lesson: updatedLesson.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar aula' }), {
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

  const { productId, moduleId, lessonId } = params
  if (!productId || !moduleId || !lessonId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const existingLesson = await db.execute({
      sql: `
        SELECT l.* FROM lessons l
        INNER JOIN modules m ON l.module_id = m.id
        WHERE l.id = ? AND m.id = ? AND m.product_id = ?
      `,
      args: [lessonId, moduleId, productId],
    })

    if (existingLesson.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aula não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: 'DELETE FROM lessons WHERE id = ?',
      args: [lessonId],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'DELETE_LESSON', 'lessons', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        lessonId,
        JSON.stringify({ module_id: moduleId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Aula removida com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover aula' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
