import type { APIRoute } from 'astro'
import { db, generateId, validateCoupon, incrementCouponUsage, logAudit } from '../../lib/turso'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const product_id = (body.product_id || '').toString()
    const full_name = (body.full_name || '').toString().trim()
    const email = (body.email || '').toString().trim().toLowerCase()
    const cpf = (body.cpf || '').toString().replace(/\D/g, '')
    const whatsapp = (body.whatsapp || '').toString().trim()
    const coupon_code = body.coupon_code ? body.coupon_code.toString().trim().toUpperCase() : ''
    const affiliate_code = body.affiliate_code ? body.affiliate_code.toString().trim().toUpperCase() : ''
    const amount_cents = parseInt(body.amount_cents) || 0
    const payment_proof_url = body.payment_proof_url ? body.payment_proof_url.toString().trim() : ''
    const payment_method = (body.payment_method || 'manual').toString()
    const notes = body.notes ? body.notes.toString().trim() : ''

    if (!product_id || !full_name || !email || !cpf) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 })
    }

    if (cpf.length !== 11) {
      return new Response(JSON.stringify({ error: 'CPF deve ter 11 dígitos' }), { status: 400 })
    }

    const productResult = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ? AND status = ?',
      args: [product_id, 'published'],
    })
    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado ou não publicado' }), { status: 404 })
    }

    let finalPrice = amount_cents || (productResult.rows[0] as any).price_cents
    let couponId: string | null = null
    let discountCents = 0

    if (coupon_code) {
      const couponResult = await validateCoupon(coupon_code, product_id, finalPrice)
      if (!couponResult.valid) {
        return new Response(JSON.stringify({ error: couponResult.error || 'Cupom inválido' }), { status: 400 })
      }
      couponId = couponResult.coupon!.id
      discountCents = couponResult.discount_cents!
      finalPrice = couponResult.final_price_cents!
      await incrementCouponUsage(couponId)
    }

    let affiliateUserId: string | null = null
    if (affiliate_code) {
      const affResult = await db.execute({
        sql: 'SELECT user_id FROM affiliates WHERE code = ? AND is_active = 1',
        args: [affiliate_code],
      })
      if (affResult.rows.length > 0) {
        affiliateUserId = (affResult.rows[0] as any).user_id
      }
    }

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    })

    let userId: string
    if (existingUser.rows.length > 0) {
      userId = (existingUser.rows[0] as any).id
    } else {
      userId = generateId()
      const passwordHash = await bcrypt.hash(cpf, 10)
      await db.execute({
        sql: `INSERT INTO users (id, email, password_hash, full_name, role, must_change_password, is_active, first_login, whatsapp, cpf, cpf_hash)
              VALUES (?, ?, ?, ?, 'student', 1, 1, 1, ?, ?, ?)`,
        args: [userId, email, passwordHash, full_name, whatsapp || null, cpf, cpf],
      })
    }

    const orderId = generateId()
    const orderNumber = `WB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    await db.execute({
      sql: `INSERT INTO orders
            (id, order_number, user_id, product_id, affiliate_id, amount_cents, coupon_id, discount_cents, payment_proof_url, payment_method, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      args: [orderId, orderNumber, userId, product_id, affiliateUserId, finalPrice, couponId, discountCents, payment_proof_url || null, payment_method, notes || null],
    })

    if (couponId) {
      await db.execute({
        sql: `INSERT INTO order_coupons (id, order_id, coupon_id, discount_cents, created_at)
              VALUES (?, ?, ?, ?, datetime('now'))`,
        args: [generateId(), orderId, couponId, discountCents],
      })
    }

    await db.execute({
      sql: `INSERT INTO notifications (id, user_id, title, body, type, link_url, read, created_at)
            VALUES (?, ?, 'Pedido Recebido', ?, 'info', '/student', 0, datetime('now'))`,
      args: [
        generateId(),
        userId,
        `Seu pedido ${orderNumber} foi recebido. Aguarde a aprovação do pagamento.`,
      ],
    })

    await logAudit(
      userId,
      'CREATE_ORDER',
      'orders',
      orderId,
      { product_id, amount_cents: finalPrice, coupon: !!couponId, affiliate: !!affiliateUserId },
      ''
    )

    return new Response(JSON.stringify({
      success: true,
      order: { id: orderId, order_number: orderNumber },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar compra' }), { status: 500 })
  }
}
