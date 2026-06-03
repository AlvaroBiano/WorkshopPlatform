import type { APIRoute } from 'astro'
import { db, slugify, generateId } from '../../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
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
    const title = (body.title || '').toString().trim()
    const type = (body.type || 'video').toString()
    const description = body.description ? body.description.toString().trim() : ''
    const duration_sec = parseInt(body.duration_sec) || 0
    const vimeo_id = body.vimeo_id ? body.vimeo_id.toString().trim() : ''
    const youtube_url = body.youtube_url ? body.youtube_url.toString().trim() : ''
    const video_url = body.video_url ? body.video_url.toString().trim() : ''
    const file_url = body.file_url ? body.file_url.toString().trim() : ''
    const sort_order = body.sort_order !== undefined ? parseInt(body.sort_order) : undefined

    if (!title) {
      return new Response(JSON.stringify({ error: 'Título é obrigatório' }), { status: 400 })
    }

    if (!['video', 'vimeo', 'youtube', 'pdf', 'text', 'quiz'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Tipo inválido' }), { status: 400 })
    }

    const moduleResult = await db.execute({
      sql: 'SELECT id FROM modules WHERE id = ? AND product_id = ?',
      args: [moduleId, productId],
    })

    if (moduleResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Módulo não encontrado neste produto' }), { status: 404 })
    }

    const id = generateId()

    const maxOrder = await db.execute({
      sql: 'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM lessons WHERE module_id = ?',
      args: [moduleId],
    })
    const finalOrder = sort_order !== undefined ? sort_order : (Number((maxOrder.rows[0] as any)?.max_order || 0) + 1)

    await db.execute({
      sql: `INSERT INTO lessons
            (id, module_id, title, slug, description, type, vimeo_id, youtube_url, video_url, file_url, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      args: [id, moduleId, title, slugify(title), description, type, vimeo_id || null, youtube_url || null, video_url || null, file_url || null, duration_sec, finalOrder],
    })

    const newLesson = await db.execute({
      sql: 'SELECT * FROM lessons WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'CREATE_LESSON', 'lessons', ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        session.profile.id,
        id,
        JSON.stringify({ title, type, module_id: moduleId }),
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
    return new Response(JSON.stringify({ error: 'Erro ao criar aula' }), { status: 500 })
  }
}
