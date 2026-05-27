import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { userId, ban, reason } = await request.json()
  if (!userId) return new Response('userId is required', { status: 400 })

  if (ban) {
    await supabaseAdmin
      .from('users')
      .update({
        banned_at: new Date().toISOString(),
        ban_reason: reason || null,
        is_active: false,
      })
      .eq('id', userId)
  } else {
    await supabaseAdmin
      .from('users')
      .update({
        banned_at: null,
        ban_reason: null,
        is_active: true,
      })
      .eq('id', userId)
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: ban ? 'BAN_USER' : 'UNBAN_USER',
    entity_type: 'users',
    entity_id: userId,
    details: { reason },
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
