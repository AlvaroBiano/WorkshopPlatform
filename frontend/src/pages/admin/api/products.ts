import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const data = await request.json()

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  await supabaseAdmin.from('audit_log').insert({
    user_id: session.profile.id,
    action: 'CREATE_PRODUCT',
    entity_type: 'products',
    entity_id: product.id,
    details: { title: product.title },
  })

  return new Response(JSON.stringify({ success: true, id: product.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
