import type { APIRoute } from 'astro'
import { db } from '../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { title, body, type = 'info', link_url } = await request.json()

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Título e corpo são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const usersResult = await db.execute(`
      SELECT id FROM users WHERE role = 'student' AND is_active = 1
    `)

    const users = usersResult.rows as any[]
    const createdNotifications = []

    for (const user of users) {
      const id = crypto.randomUUID()
      
      await db.execute({
        sql: `
          INSERT INTO notifications (id, user_id, title, body, type, link_url, read, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
        `,
        args: [id, user.id, title, body, type, link_url || ''],
      })

      createdNotifications.push(id)
    }

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'BROADCAST_NOTIFICATION', 'notifications', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        createdNotifications[0] || '',
        JSON.stringify({ title, count: createdNotifications.length }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: `Notificação enviada para ${createdNotifications.length} alunos`,
      count: createdNotifications.length,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error broadcasting notification:', error)
    return new Response(JSON.stringify({ error: 'Erro ao enviar notificação' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
