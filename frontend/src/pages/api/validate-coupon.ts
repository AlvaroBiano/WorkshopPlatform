import type { APIRoute } from 'astro'
import { db } from '@lib/turso'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, product_id, amount_cents } = await request.json()

    if (!code) {
      return new Response(JSON.stringify({ error: 'Código é obrigatório' }), { status: 400 })
    }

    const result = await db.execute({
      sql: `SELECT * FROM coupons
            WHERE code = ? AND is_active = 1
            AND (valid_from IS NULL OR valid_from <= datetime('now'))
            AND (valid_until IS NULL OR valid_until >= datetime('now'))
            AND (product_id IS NULL OR product_id = ?)
            AND (max_uses IS NULL OR used_count < max_uses)`,
      args: [code.toUpperCase(), product_id || null],
    })

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Cupom inválido ou expirado' }), { status: 400 })
    }

    const coupon = result.rows[0] as any

    let discountCents = 0
    if (coupon.discount_type === 'percentage') {
      discountCents = Math.round((amount_cents * coupon.discount_value) / 100)
    } else {
      discountCents = coupon.discount_value
    }
    const finalPrice = Math.max(0, amount_cents - discountCents)

    return new Response(JSON.stringify({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discount_cents: discountCents,
      final_price_cents: finalPrice,
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao validar cupom' }), { status: 500 })
  }
}