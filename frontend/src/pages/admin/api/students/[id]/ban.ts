import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
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
    const { reason } = await request.json()

    if (!reason) {
      return new Response(JSON.stringify({ error: 'Motivo do banimento é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existingUser = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    if (existingUser.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aluno não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: `
        UPDATE users 
        SET banned_at = datetime('now'), ban_reason = ?, is_active = 0, updated_at = datetime('now')
        WHERE id = ?
      `,
      args: [reason, id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'BAN_STUDENT', 'users', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ reason }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const bannedStudent = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      student: bannedStudent.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error banning student:', error)
    return new Response(JSON.stringify({ error: 'Erro ao banir aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
