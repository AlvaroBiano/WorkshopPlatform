import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies } from '../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await db.execute({
      sql: 'SELECT id, title, body, type, link_url, read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      args: [session.profile.id],
    })

    return new Response(JSON.stringify({
      notifications: result.rows,
      unread_count: (result.rows as any[]).filter(n => !n.read).length,
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    if (body.mark_all_read) {
      await db.execute({
        sql: 'UPDATE notifications SET read = 1, read_at = datetime("now") WHERE user_id = ? AND read = 0',
        args: [session.profile.id],
      })
    } else if (body.id) {
      await db.execute({
        sql: 'UPDATE notifications SET read = 1, read_at = datetime("now") WHERE id = ? AND user_id = ?',
        args: [body.id, session.profile.id],
      })
    }
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
