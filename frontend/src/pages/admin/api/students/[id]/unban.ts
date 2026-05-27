import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

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
        SET banned_at = NULL, ban_reason = NULL, is_active = 1, updated_at = datetime('now')
        WHERE id = ?
      `,
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UNBAN_STUDENT', 'users', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({}),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const unbannedStudent = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      student: unbannedStudent.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error unbanning student:', error)
    return new Response(JSON.stringify({ error: 'Erro ao desbanir aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
