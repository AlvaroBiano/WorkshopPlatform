import type { APIRoute } from 'astro'
import { db, generateId, logAudit } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
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

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
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

    await logAudit(
      session.profile.id,
      `REVIEW_${status.toUpperCase()}`,
      'reviews',
      id,
      undefined,
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
