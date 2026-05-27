import type { APIRoute } from 'astro'
import { db } from '../../lib/turso'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { product_id, full_name, email, cpf, whatsapp, coupon_code, amount_cents } = await request.json()

    if (!product_id || !full_name || !email || !cpf) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 })
    }

    let finalPrice = amount_cents
    let couponId = null
    let discountCents = 0

    if (coupon_code) {
      const couponResult = await db.execute({
        sql: `SELECT * FROM coupons WHERE code = ? AND is_active = 1
              AND (max_uses IS NULL OR used_count < max_uses)
              AND (product_id IS NULL OR product_id = ?)`,
        args: [coupon_code.toUpperCase(), product_id],
      })

      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0] as any
        couponId = coupon.id
        
        if (coupon.discount_type === 'percentage') {
          discountCents = Math.round((amount_cents * coupon.discount_value) / 100)
        } else {
          discountCents = coupon.discount_value
        }
        
        finalPrice = Math.max(0, amount_cents - discountCents)

        await db.execute({
          sql: 'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
          args: [coupon.id],
        })
      }
    }

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    })

    let userId: string
    if (existingUser.rows.length > 0) {
      userId = (existingUser.rows[0] as any).id
    } else {
      userId = crypto.randomUUID()
      const passwordHash = await bcrypt.hash(cpf, 10)
      
      await db.execute({
        sql: `INSERT INTO users (id, email, password_hash, full_name, role, must_change_password, is_active, whatsapp, cpf)
              VALUES (?, ?, ?, ?, 'student', 1, 1, ?, ?)`,
        args: [userId, email.toLowerCase(), passwordHash, full_name, whatsapp || null, cpf],
      })
    }

    const orderId = crypto.randomUUID()
    const orderNumber = `WB-${Date.now()}`

    await db.execute({
      sql: `INSERT INTO orders (id, order_number, user_id, product_id, amount_cents, coupon_id, discount_cents, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      args: [orderId, orderNumber, userId, product_id, finalPrice, couponId, discountCents],
    })

    if (couponId) {
      await db.execute({
        sql: `INSERT INTO order_coupons (id, order_id, coupon_id, discount_cents, created_at)
              VALUES (?, ?, ?, ?, datetime('now'))`,
        args: [crypto.randomUUID(), orderId, couponId, discountCents],
      })
    }

    await db.execute({
      sql: `INSERT INTO notifications (id, user_id, type, title, body)
            VALUES (?, ?, 'info', 'Pedido Recebido', ?)`,
      args: [crypto.randomUUID(), userId, `Seu pedido ${orderNumber} foi recebido. Aguarde a aprovação do pagamento.`],
    })

    return new Response(JSON.stringify({
      success: true,
      order: { id: orderId, order_number: orderNumber },
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar compra' }), { status: 500 })
  }
}
