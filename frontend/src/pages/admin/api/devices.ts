import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id, action, reason } = await request.json()
  if (!id || !action) return new Response('id and action are required', { status: 400 })

  if (action === 'approve') {
    const { error } = await supabaseAdmin
      .from('devices')
      .update({ is_approved: true })
      .eq('id', id)

    if (error) return new Response(error.message, { status: 500 })
  } else if (action === 'block') {
    const { error } = await supabaseAdmin
      .from('devices')
      .update({ is_blocked: true })
      .eq('id', id)

    if (error) return new Response(error.message, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: action === 'approve' ? 'APPROVE_DEVICE' : 'BLOCK_DEVICE',
    entity_type: 'devices',
    entity_id: id,
    details: { reason },
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
