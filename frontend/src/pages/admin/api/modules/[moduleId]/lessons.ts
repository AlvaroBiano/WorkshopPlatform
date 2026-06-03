import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const moduleId = params.moduleId
  const data = await request.json()

  if (!data.title) {
    return new Response('title is required', { status: 400 })
  }

  const countResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM lessons WHERE module_id = ?',
    args: [moduleId],
  })
  const count = Number(countResult.rows[0]?.count || 0)

  const id = crypto.randomUUID()
  await db.execute({
    sql: `INSERT INTO lessons (id, module_id, title, type, duration_sec, sort_order, description, vimeo_id, youtube_url, file_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, moduleId, data.title, data.type || 'vimeo', data.duration_sec || 0, count + 1, data.description || null, data.vimeo_id || null, data.youtube_url || null, data.file_url || null],
  })

  return new Response(JSON.stringify({ success: true, id }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
