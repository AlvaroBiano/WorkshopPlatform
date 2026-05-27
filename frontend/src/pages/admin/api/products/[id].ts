import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../../lib/auth'

export const PUT: APIRoute = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const productId = params.id
  const data = await request.json()

  const { error } = await supabaseAdmin
    .from('products')
    .update(data)
    .eq('id', productId)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: 'UPDATE_PRODUCT',
    entity_type: 'products',
    entity_id: productId,
    details: data,
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const productId = params.id

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
