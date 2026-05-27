import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id, reason } = await request.json()
  if (!id) return new Response('id is required', { status: 400 })

  await supabaseAdmin
    .from('pending_registrations')
    .update({
      status: 'rejected',
      reviewed_by: session.profile.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq('id', id)

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: 'REJECT_STUDENT',
    entity_type: 'pending_registrations',
    entity_id: id,
    details: { reason },
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
