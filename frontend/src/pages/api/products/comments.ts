import type { APIRoute } from 'astro'
import { db, generateId } from '@lib/turso'
import { getSessionFromCookies } from '@lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const lessonId = url.searchParams.get('lesson_id')

  if (!lessonId) {
    return new Response(JSON.stringify({ error: 'lesson_id é obrigatório' }), { status: 400 })
  }

  try {
    const result = await db.execute({
      sql: `SELECT c.*, u.full_name FROM comments c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.lesson_id = ? AND c.status = 'approved'
            ORDER BY c.created_at DESC`,
      args: [lessonId],
    })

    return new Response(JSON.stringify({ comments: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const lessonId = (body.lesson_id || '').toString()
    const text = (body.body || '').toString().trim()
    const parentId = body.parent_id ? body.parent_id.toString() : null

    if (!lessonId || !text) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 })
    }

    const accessCheck = await db.execute({
      sql: `SELECT 1 FROM product_access pa
            INNER JOIN lessons l ON l.module_id IN (SELECT id FROM modules WHERE product_id = pa.product_id)
            WHERE pa.user_id = ? AND l.id = ?`,
      args: [session.profile.id, lessonId],
    })
    if (accessCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Sem acesso a esta aula' }), { status: 403 })
    }

    const id = generateId()
    await db.execute({
      sql: `INSERT INTO comments (id, lesson_id, user_id, body, parent_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'))`,
      args: [id, lessonId, session.profile.id, text, parentId],
    })

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
