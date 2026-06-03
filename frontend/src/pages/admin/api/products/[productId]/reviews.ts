import type { APIRoute } from 'astro'
import { db, generateId } from '../../../../../lib/turso'
import { getSessionFromCookies } from '../../../../../lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'pending'

  try {
    const result = await db.execute({
      sql: `SELECT r.*, u.full_name, u.email, p.title as product_title
            FROM reviews r
            INNER JOIN users u ON r.user_id = u.id
            INNER JOIN products p ON r.product_id = p.id
            WHERE r.status = ?
            ORDER BY r.created_at DESC`,
      args: [status],
    })

    return new Response(JSON.stringify({ reviews: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
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
    const product_id = (body.product_id || '').toString()
    const rating = parseInt(body.rating) || 0
    const title = body.title ? body.title.toString().trim() : ''
    const bodyText = body.body ? body.body.toString().trim() : ''

    if (!product_id || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), { status: 400 })
    }

    const accessCheck = await db.execute({
      sql: 'SELECT id FROM product_access WHERE user_id = ? AND product_id = ?',
      args: [session.profile.id, product_id],
    })
    if (accessCheck.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Você precisa ter acesso ao produto para avaliá-lo' }), { status: 403 })
    }

    const id = generateId()
    await db.execute({
      sql: `INSERT INTO reviews (id, product_id, user_id, rating, title, body, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      args: [id, product_id, session.profile.id, rating, title, bodyText],
    })

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || session.profile.role !== 'admin' && session.profile.role !== 'super_admin') {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const body = await request.json()
    const id = (body.id || '').toString()
    const status = (body.status || 'pending').toString()

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID obrigatório' }), { status: 400 })
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Status inválido' }), { status: 400 })
    }

    await db.execute({
      sql: 'UPDATE reviews SET status = ? WHERE id = ?',
      args: [status, id],
    })

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error moderating review:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
