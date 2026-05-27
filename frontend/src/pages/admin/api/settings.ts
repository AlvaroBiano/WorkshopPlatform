import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const data = await request.json()

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert({
      key: 'platform',
      value: data,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'key',
    })

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: 'UPDATE_SETTINGS',
    entity_type: 'settings',
    details: data,
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
