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
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''

  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (search) {
    whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR d.device_info LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  if (status === 'approved') {
    whereClause += ' AND d.is_approved = 1'
  } else if (status === 'pending') {
    whereClause += ' AND d.is_approved = 0'
  }

  try {
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM devices d
        LEFT JOIN users u ON d.user_id = u.id
        ${whereClause}
      `,
      args: params,
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const devicesResult = await db.execute({
      sql: `
        SELECT 
          d.*,
          u.full_name as user_name,
          u.email as user_email
        FROM devices d
        LEFT JOIN users u ON d.user_id = u.id
        ${whereClause}
        ORDER BY d.registered_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...params, limit, offset],
    })

    return new Response(JSON.stringify({
      devices: devicesResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching devices:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar dispositivos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
