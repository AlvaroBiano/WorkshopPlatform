import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../../../../lib/auth'

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const moduleId = params.moduleId

  const { error } = await supabaseAdmin
    .from('modules')
    .delete()
    .eq('id', moduleId)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
