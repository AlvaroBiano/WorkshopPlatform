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
  const type = url.searchParams.get('type') || ''

  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (search) {
    whereClause += ' AND (n.title LIKE ? OR n.body LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  }

  if (type) {
    whereClause += ' AND n.type = ?'
    params.push(type)
  }

  try {
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total 
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ${whereClause}
      `,
      args: params,
    })

    const total = Number((countResult.rows[0] as any)?.total || 0)

    const notificationsResult = await db.execute({
      sql: `
        SELECT 
          n.*,
          u.full_name as user_name,
          u.email as user_email
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...params, limit, offset],
    })

    return new Response(JSON.stringify({
      notifications: notificationsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar notificações' }), {
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
    const { user_ids, title, body, type = 'info', link_url } = await request.json()

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'user_ids é obrigatório e deve ser um array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Título e corpo são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const createdNotifications = []

    for (const user_id of user_ids) {
      const id = crypto.randomUUID()
      
      await db.execute({
        sql: `
          INSERT INTO notifications (id, user_id, title, body, type, link_url, read, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
        `,
        args: [id, user_id, title, body, type, link_url || ''],
      })

      createdNotifications.push(id)
    }

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'SEND_NOTIFICATIONS', 'notifications', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        createdNotifications[0],
        JSON.stringify({ user_ids, title, count: createdNotifications.length }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: `${createdNotifications.length} notificações enviadas com sucesso`,
      count: createdNotifications.length,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(JSON.stringify({ error: 'Erro ao enviar notificações' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
