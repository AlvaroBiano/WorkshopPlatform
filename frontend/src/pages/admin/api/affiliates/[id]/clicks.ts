import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  try {
    const affiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    if (affiliate.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Afiliado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM affiliate_clicks WHERE affiliate_id = ?',
      args: [id],
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const clicksResult = await db.execute({
      sql: `
        SELECT * FROM affiliate_clicks 
        WHERE affiliate_id = ? 
        ORDER BY clicked_at DESC 
        LIMIT ? OFFSET ?
      `,
      args: [id, limit, offset],
    })

    return new Response(JSON.stringify({
      clicks: clicksResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching affiliate clicks:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar cliques' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
