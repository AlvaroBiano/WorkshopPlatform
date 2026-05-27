import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const notificationResult = await db.execute({
      sql: 'SELECT * FROM notifications WHERE id = ?',
      args: [id],
    })

    if (notificationResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Notificação não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: 'DELETE FROM notifications WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'DELETE_NOTIFICATION', 'notifications', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({}),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Notificação removida com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return new Response(JSON.stringify({ error: 'Erro ao remover notificação' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
