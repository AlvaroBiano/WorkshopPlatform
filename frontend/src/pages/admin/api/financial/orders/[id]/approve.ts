import type { APIRoute } from 'astro'
import { db, generateId, grantProductAccess, confirmAffiliateCommission, logAudit } from '../../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400 })
  }

  try {
    const orderResult = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    })

    if (orderResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Pedido não encontrado' }), { status: 404 })
    }

    const order = orderResult.rows[0] as any

    if (order.status === 'approved') {
      return new Response(JSON.stringify({ error: 'Pedido já foi aprovado' }), { status: 400 })
    }

    await db.execute({
      sql: `UPDATE orders
            SET status = 'approved', approved_at = datetime('now'), approved_by = ?
            WHERE id = ?`,
      args: [session.profile.id, id],
    })

    await grantProductAccess(order.user_id, order.product_id, session.profile.id)

    await db.execute({
      sql: `INSERT INTO notifications (id, user_id, title, body, type, link_url, read, created_at)
            VALUES (?, ?, 'Pedido Aprovado!', ?, 'success', '/student', 0, datetime('now'))`,
      args: [
        generateId(),
        order.user_id,
        'Seu pedido foi aprovado e você já tem acesso ao produto.',
      ],
    })

    if (order.affiliate_id) {
      try {
        await confirmAffiliateCommission(id)
      } catch (e) {
        console.error('Erro ao confirmar comissão:', e)
      }
    }

    await logAudit(
      session.profile.id,
      'APPROVE_ORDER',
      'orders',
      id,
      { user_id: order.user_id, product_id: order.product_id, affiliate_id: order.affiliate_id || null },
      request.headers.get('x-forwarded-for') || 'unknown'
    )

    const updated = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      order: updated.rows[0],
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error approving order:', error)
    return new Response(JSON.stringify({ error: 'Erro ao aprovar pedido' }), { status: 500 })
  }
}
