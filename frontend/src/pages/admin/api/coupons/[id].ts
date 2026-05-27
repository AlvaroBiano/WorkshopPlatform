import type { APIRoute } from 'astro'
import { db } from '../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { id } = params
    const { is_active } = await request.json()

    await db.execute({
      sql: 'UPDATE coupons SET is_active = ? WHERE id = ?',
      args: [is_active ? 1 : 0, id],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar cupom' }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { id } = params
    await db.execute({ sql: 'DELETE FROM coupons WHERE id = ?', args: [id] })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao remover cupom' }), { status: 500 })
  }
}
