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
  const status = url.searchParams.get('status') || ''
  const offset = (page - 1) * limit

  let whereClause = 'WHERE ac.affiliate_id = ?'
  const params_query: any[] = [id]

  if (status) {
    whereClause += ' AND ac.status = ?'
    params_query.push(status)
  }

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
      sql: `SELECT COUNT(*) as total FROM affiliate_conversions ac ${whereClause}`,
      args: params_query,
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const conversionsResult = await db.execute({
      sql: `
        SELECT 
          ac.*,
          o.order_number,
          o.amount_cents as order_amount,
          u.full_name as user_name,
          u.email as user_email,
          p.title as product_title
        FROM affiliate_conversions ac
        LEFT JOIN orders o ON ac.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN products p ON o.product_id = p.id
        ${whereClause}
        ORDER BY ac.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...params_query, limit, offset],
    })

    return new Response(JSON.stringify({
      conversions: conversionsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching affiliate conversions:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar conversões' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
