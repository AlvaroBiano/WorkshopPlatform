import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
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

  try {
    const deviceResult = await db.execute({
      sql: 'SELECT * FROM devices WHERE id = ?',
      args: [id],
    })

    if (deviceResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Dispositivo não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const device = deviceResult.rows[0] as any

    if (device.is_approved) {
      return new Response(JSON.stringify({ error: 'Dispositivo já foi aprovado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: `UPDATE devices SET is_approved = 1 WHERE id = ?`,
      args: [id],
    })

    const notificationId = crypto.randomUUID()
    await db.execute({
      sql: `
        INSERT INTO notifications (id, user_id, title, body, type, read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
      `,
      args: [
        notificationId,
        device.user_id,
        'Dispositivo Aprovado',
        'Seu novo dispositivo foi aprovado e você já pode acessá-lo.',
        'success',
      ],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'APPROVE_DEVICE', 'devices', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ device_id: id, user_id: device.user_id }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedDevice = await db.execute({
      sql: 'SELECT * FROM devices WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      device: updatedDevice.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error approving device:', error)
    return new Response(JSON.stringify({ error: 'Erro ao aprovar dispositivo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
