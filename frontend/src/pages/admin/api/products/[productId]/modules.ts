import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../../../../lib/supabase-server'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const productId = params.productId
  const { title } = await request.json()

  if (!title) {
    return new Response('title is required', { status: 400 })
  }

  const { count } = await supabaseAdmin
    .from('modules')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  const { data: module, error } = await supabaseAdmin
    .from('modules')
    .insert({
      product_id: productId,
      title,
      sort_order: (count || 0) + 1,
    })
    .select()
    .single()

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, id: module.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
