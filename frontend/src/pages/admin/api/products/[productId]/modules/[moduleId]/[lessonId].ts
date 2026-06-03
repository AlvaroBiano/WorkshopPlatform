import type { APIRoute } from 'astro'
import { db, slugify, generateId } from '../../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId, lessonId } = params
  if (!productId || !moduleId || !lessonId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), { status: 400 })
  }

  try {
    const body = await request.json()
    const title = body.title !== undefined ? body.title.toString().trim() : undefined
    const type = body.type !== undefined ? body.type.toString() : undefined
    const description = body.description !== undefined ? body.description.toString().trim() : undefined
    const duration_sec = body.duration_sec !== undefined ? parseInt(body.duration_sec) : undefined
    const vimeo_id = body.vimeo_id !== undefined ? body.vimeo_id.toString().trim() : undefined
    const youtube_url = body.youtube_url !== undefined ? body.youtube_url.toString().trim() : undefined
    const video_url = body.video_url !== undefined ? body.video_url.toString().trim() : undefined
    const file_url = body.file_url !== undefined ? body.file_url.toString().trim() : undefined
    const sort_order = body.sort_order !== undefined ? parseInt(body.sort_order) : undefined

    const existing = await db.execute({
      sql: `SELECT l.* FROM lessons l
            INNER JOIN modules m ON l.module_id = m.id
            WHERE l.id = ? AND m.id = ? AND m.product_id = ?`,
      args: [lessonId, moduleId, productId],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aula não encontrada' }), { status: 404 })
    }

    const updates: string[] = []
    const args: any[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      args.push(title)
      updates.push('slug = ?')
      args.push(slugify(title))
    }
    if (type !== undefined) {
      updates.push('type = ?')
      args.push(type)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      args.push(description || null)
    }
    if (duration_sec !== undefined) {
      updates.push('duration_sec = ?')
      args.push(duration_sec)
    }
    if (vimeo_id !== undefined) {
      updates.push('vimeo_id = ?')
      args.push(vimeo_id || null)
    }
    if (youtube_url !== undefined) {
      updates.push('youtube_url = ?')
      args.push(youtube_url || null)
    }
    if (video_url !== undefined) {
      updates.push('video_url = ?')
      args.push(video_url || null)
    }
    if (file_url !== undefined) {
      updates.push('file_url = ?')
      args.push(file_url || null)
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      args.push(sort_order)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), { status: 400 })
    }

    args.push(lessonId)
    await db.execute({
      sql: `UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'UPDATE_LESSON', 'lessons', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        lessonId,
        JSON.stringify({ title, type, module_id: moduleId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updated = await db.execute({
      sql: 'SELECT * FROM lessons WHERE id = ?',
      args: [lessonId],
    })

    return new Response(JSON.stringify({
      success: true,
      lesson: updated.rows[0],
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar aula' }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId, moduleId, lessonId } = params
  if (!productId || !moduleId || !lessonId) {
    return new Response(JSON.stringify({ error: 'IDs são obrigatórios' }), { status: 400 })
  }

  try {
    const existing = await db.execute({
      sql: `SELECT l.id FROM lessons l
            INNER JOIN modules m ON l.module_id = m.id
            WHERE l.id = ? AND m.id = ? AND m.product_id = ?`,
      args: [lessonId, moduleId, productId],
    })

    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aula não encontrada' }), { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM lessons WHERE id = ?', args: [lessonId] })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'DELETE_LESSON', 'lessons', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        lessonId,
        JSON.stringify({ module_id: moduleId }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Aula removida com sucesso',
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover aula' }), { status: 500 })
  }
}
