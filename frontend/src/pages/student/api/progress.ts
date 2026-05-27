import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { lessonId, watchedSec, lastPositionSec, completed } = await request.json()

  if (!lessonId) {
    return new Response('lessonId is required', { status: 400 })
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?',
      args: [session.profile.id, lessonId],
    })

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE progress SET watched_sec = ?, completed = ?, last_seen_at = datetime('now')
              WHERE user_id = ? AND lesson_id = ?`,
        args: [watchedSec || 0, completed ? 1 : 0, session.profile.id, lessonId],
      })
    } else {
      await db.execute({
        sql: `INSERT INTO progress (id, user_id, lesson_id, watched_sec, completed, last_seen_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        args: [crypto.randomUUID(), session.profile.id, lessonId, watchedSec || 0, completed ? 1 : 0],
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro ao salvar progresso:', error)
    return new Response('Erro ao salvar progresso', { status: 500 })
  }
}
