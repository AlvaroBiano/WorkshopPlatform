import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
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

  const { error } = await supabaseAdmin
    .from('progress')
    .upsert({
      user_id: session.profile.id,
      lesson_id: lessonId,
      watched_sec: watchedSec || 0,
      completed: completed || false,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,lesson_id',
    })

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
