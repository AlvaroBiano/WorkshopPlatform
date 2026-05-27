import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id, action } = await request.json()
  if (!id || !action) return new Response('id and action are required', { status: 400 })

  if (action === 'approve') {
    await supabaseAdmin
      .from('affiliates')
      .update({
        status: 'active',
        approved_at: new Date().toISOString(),
        approved_by: session.profile.id,
      })
      .eq('id', id)
  } else if (action === 'block') {
    await supabaseAdmin
      .from('affiliates')
      .update({ status: 'blocked' })
      .eq('id', id)
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
