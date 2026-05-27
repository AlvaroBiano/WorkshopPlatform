import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const GET: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''
  const sort = url.searchParams.get('sort') || 'created_at'
  const order = url.searchParams.get('order') || 'desc'

  const offset = (page - 1) * limit

  let whereClause = "WHERE role = 'student'"
  const params: any[] = []

  if (search) {
    whereClause += ' AND (full_name LIKE ? OR email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  if (status === 'active') {
    whereClause += ' AND is_active = 1 AND banned_at IS NULL'
  } else if (status === 'inactive') {
    whereClause += ' AND is_active = 0'
  } else if (status === 'banned') {
    whereClause += ' AND banned_at IS NOT NULL'
  }

  const validSortColumns = ['created_at', 'full_name', 'email', 'last_login_at']
  const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at'
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC'

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM users ${whereClause}`,
    args: params,
  })

  const total = Number(countResult.rows[0]?.total || 0)

  const studentsResult = await db.execute({
    sql: `
      SELECT 
        u.*,
        COUNT(pa.id) as products_count
      FROM users u
      LEFT JOIN product_access pa ON u.id = pa.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `,
    args: [...params, limit, offset],
  })

  return new Response(JSON.stringify({
    students: studentsResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
