import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { recipient, user_email, title, body, link_url } = await request.json()

  if (!title || !body) {
    return new Response('title and body are required', { status: 400 })
  }

  let userIds: string[] = []

  if (recipient === 'all') {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'student')
      .eq('is_active', true)

    userIds = (users || []).map(u => u.id)
  } else if (recipient === 'specific' && user_email) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user_email.toLowerCase())
      .single()

    if (!user) {
      return new Response('Usuário não encontrado', { status: 404 })
    }

    userIds = [user.id]
  }

  if (userIds.length === 0) {
    return new Response('Nenhum destinatário encontrado', { status: 400 })
  }

  const notifications = userIds.map(userId => ({
    user_id: userId,
    title,
    body,
    link_url,
    type: 'announcement',
  }))

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert(notifications)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: 'SEND_NOTIFICATION',
    entity_type: 'notifications',
    details: { recipient, count: userIds.length, title },
  })

  return new Response(JSON.stringify({ success: true, sent: userIds.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
