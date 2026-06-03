import type { APIRoute } from 'astro'
import { db, generateId } from '../../../../../lib/turso'
import { getSessionFromCookies } from '../../../../../lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'approved'

  try {
    const result = await db.execute({
      sql: `SELECT c.*, u.full_name, u.email, l.title as lesson_title, m.title as module_title
            FROM comments c
            INNER JOIN users u ON c.user_id = u.id
            INNER JOIN lessons l ON c.lesson_id = l.id
            INNER JOIN modules m ON l.module_id = m.id
            WHERE c.status = ?
            ORDER BY c.created_at DESC`,
      args: [status],
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
    const lesson_id = (body.lesson_id || '').toString()
    const commentText = (body.body || '').toString().trim()
    const parent_id = body.parent_id ? body.parent_id.toString() : null

    if (!lesson_id || !commentText) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 })
    }

    const accessCheck = await db.execute({
      sql: `SELECT 1 FROM product_access pa
            INNER JOIN lessons l ON l.module_id IN (SELECT id FROM modules WHERE product_id = pa.product_id)
            WHERE pa.user_id = ? AND l.id = ?`,
      args: [session.profile.id, lesson_id],
    })
    if (accessCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Sem acesso a esta aula' }), { status: 403 })
    }

    const id = generateId()
    await db.execute({
      sql: `INSERT INTO comments (id, lesson_id, user_id, body, parent_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'))`,
      args: [id, lesson_id, session.profile.id, commentText, parent_id],
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

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || (session.profile.role !== 'admin' && session.profile.role !== 'super_admin')) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const body = await request.json()
    const id = (body.id || '').toString()
    const status = (body.status || 'approved').toString()

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID obrigatório' }), { status: 400 })
    }

    if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Status inválido' }), { status: 400 })
    }

    await db.execute({
      sql: 'UPDATE comments SET status = ? WHERE id = ?',
      args: [status, id],
    })

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error moderating comment:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
