import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id, reason } = await request.json()
  if (!id) return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  try {
    await db.execute({
      sql: `UPDATE pending_registrations SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now'), rejection_reason = ? WHERE id = ?`,
      args: [session.profile.id, reason || null, id],
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'REJECT_STUDENT', 'pending_registrations', ?, ?, ?, datetime('now'))`,
      args: [crypto.randomUUID(), session.profile.id, id, JSON.stringify({ reason }), request.headers.get('x-forwarded-for') || 'unknown'],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro ao rejeitar aluno:', error)
    return new Response(JSON.stringify({ error: 'Erro ao rejeitar aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
