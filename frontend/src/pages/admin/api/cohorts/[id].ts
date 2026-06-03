import type { APIRoute } from 'astro'
import { db, logAudit } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID obrigatório' }), { status: 400 })
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM cohorts WHERE id = ?',
      args: [id],
    })
    if (existing.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Turma não encontrada' }), { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM cohorts WHERE id = ?', args: [id] })

    await logAudit(
      session.profile.id,
      'DELETE_COHORT',
      'cohorts',
      id,
      undefined,
      ''
    )

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error deleting cohort:', error)
    return new Response(JSON.stringify({ error: 'Erro' }), { status: 500 })
  }
}
