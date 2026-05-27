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

    if (order.status === 'approved') {
      return new Response(JSON.stringify({ error: 'Pedido já foi aprovado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await db.execute({
      sql: `
        UPDATE orders 
        SET status = 'approved', approved_at = datetime('now'), approved_by = ?
        WHERE id = ?
      `,
      args: [session.profile.id, id],
    })

    const accessId = crypto.randomUUID()
    await db.execute({
      sql: `
        INSERT INTO product_access (id, user_id, product_id, granted_at, granted_by)
        VALUES (?, ?, ?, datetime('now'), ?)
      `,
      args: [accessId, order.user_id, order.product_id, session.profile.id],
    })

    const notificationId = crypto.randomUUID()
    await db.execute({
      sql: `
        INSERT INTO notifications (id, user_id, title, body, type, link_url, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
      `,
      args: [
        notificationId,
        order.user_id,
        'Pedido Aprovado!',
        'Seu pedido foi aprovado e você já tem acesso ao produto.',
        'success',
        '/student',
      ],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'APPROVE_ORDER', 'orders', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ order_id: id, user_id: order.user_id, product_id: order.product_id }),
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
    console.error('Error approving order:', error)
    return new Response(JSON.stringify({ error: 'Erro ao aprovar pedido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
