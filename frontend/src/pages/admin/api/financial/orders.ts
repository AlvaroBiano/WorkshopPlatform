import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const status = url.searchParams.get('status') || ''
  const search = url.searchParams.get('search') || ''

  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (status) {
    whereClause += ' AND o.status = ?'
    params.push(status)
  }

  if (search) {
    whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR o.order_number LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  try {
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
      `,
      args: params,
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const ordersResult = await db.execute({
      sql: `
        SELECT 
          o.*,
          u.full_name as user_name,
          u.email as user_email,
          p.title as product_title
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN products p ON o.product_id = p.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...params, limit, offset],
    })

    return new Response(JSON.stringify({
      orders: ordersResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar pedidos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
