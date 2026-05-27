import type { APIRoute } from 'astro'
import { db } from '../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../lib/auth'

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
    const { reason } = await request.json()

    if (!reason) {
      return new Response(JSON.stringify({ error: 'Motivo da rejeição é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const orderResult = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    })

    if (orderResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const order = orderResult.rows[0] as any

    if (order.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Pedido já foi rejeitado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: `
        UPDATE orders 
        SET status = 'rejected', rejected_at = datetime('now'), rejected_by = ?, rejection_reason = ?
        WHERE id = ?
      `,
      args: [session.profile.id, reason, id],
    })

    const notificationId = crypto.randomUUID()
    await db.execute({
      sql: `
        INSERT INTO notifications (id, user_id, title, body, type, read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
      `,
      args: [
        notificationId,
        order.user_id,
        'Pedido Rejeitado',
        `Seu pedido foi rejeitado. Motivo: ${reason}`,
        'error',
      ],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'REJECT_ORDER', 'orders', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ order_id: id, reason }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedOrder = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      order: updatedOrder.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error rejecting order:', error)
    return new Response(JSON.stringify({ error: 'Erro ao rejeitar pedido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
