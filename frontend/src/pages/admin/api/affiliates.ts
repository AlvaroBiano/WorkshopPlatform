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

  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (search) {
    whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR a.code LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  if (status === 'active') {
    whereClause += ' AND a.is_active = 1'
  } else if (status === 'inactive') {
    whereClause += ' AND a.is_active = 0'
  }

  try {
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM affiliates a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
      `,
      args: params,
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const affiliatesResult = await db.execute({
      sql: `
        SELECT 
          a.*,
          u.full_name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = a.id) as clicks_count,
          (SELECT COUNT(*) FROM affiliate_conversions WHERE affiliate_id = a.id) as conversions_count,
          (SELECT SUM(commission_cents) FROM affiliate_conversions WHERE affiliate_id = a.id AND status = 'paid') as total_paid_cents,
          (SELECT SUM(commission_cents) FROM affiliate_conversions WHERE affiliate_id = a.id AND status = 'pending') as total_pending_cents
        FROM affiliates a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...params, limit, offset],
    })

    return new Response(JSON.stringify({
      affiliates: affiliatesResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching affiliates:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar afiliados' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { user_id, commission_pct = 40 } = await request.json()

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [user_id],
    })

    if (user.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existingAffiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE user_id = ?',
      args: [user_id],
    })

    if (existingAffiliate.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Usuário já é afiliado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = crypto.randomUUID()
    const code = (user.rows[0] as any).full_name
      .split(' ')[0]
      .toUpperCase()
      .substring(0, 6) + Math.random().toString(36).substring(2, 6).toUpperCase()

    await db.execute({
      sql: `
        INSERT INTO affiliates (id, user_id, code, commission_pct, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
      `,
      args: [id, user_id, code, commission_pct],
    })

    await db.execute({
      sql: `UPDATE users SET role = 'affiliate' WHERE id = ?`,
      args: [user_id],
    })

    const newAffiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'CREATE_AFFILIATE', 'affiliates', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ user_id, code, commission_pct }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      affiliate: newAffiliate.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating affiliate:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar afiliado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
