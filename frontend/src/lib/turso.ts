import { createClient, type Client } from '@libsql/client'
import { randomUUID } from 'crypto'

const url = process.env.TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.warn('Missing Turso environment variables', { url: !!url, authToken: !!authToken })
}

export const db: Client = createClient({
  url: url || 'file:local.db',
  authToken: authToken || '',
})

export function generateId(): string {
  return randomUUID()
}

export function now(): string {
  return new Date().toISOString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

export async function grantProductAccess(
  userId: string,
  productId: string,
  grantedBy?: string
): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO product_access (user_id, product_id, granted_at, granted_by)
          VALUES (?, ?, datetime('now'), ?)`,
    args: [userId, productId, grantedBy || null],
  })
}

export async function revokeProductAccess(
  userId: string,
  productId: string
): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM product_access WHERE user_id = ? AND product_id = ?',
    args: [userId, productId],
  })
}

export async function registerAffiliateClick(
  affiliateId: string,
  visitorFp: string,
  ip?: string,
  userAgent?: string,
  referrer?: string,
  landingUrl?: string
): Promise<string> {
  const id = generateId()
  await db.execute({
    sql: `INSERT INTO affiliate_clicks (id, affiliate_id, visitor_fp, ip, user_agent, referrer, landing_url, clicked_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [id, affiliateId, visitorFp, ip || null, userAgent || null, referrer || null, landingUrl || null],
  })
  return id
}

export async function creditAffiliateCommission(orderId: string): Promise<void> {
  const orderResult = await db.execute({
    sql: `SELECT o.id, o.user_id, o.amount_cents, o.affiliate_id,
                 p.id as p_id, p.is_affiliable, p.affiliate_commission_pct
          FROM orders o
          INNER JOIN products p ON p.id = o.product_id
          WHERE o.id = ?`,
    args: [orderId],
  })

  if (orderResult.rows.length === 0) return

  const order = orderResult.rows[0] as any
  if (!order.affiliate_id || !order.is_affiliable) return

  const affiliateResult = await db.execute({
    sql: 'SELECT id FROM affiliates WHERE user_id = ?',
    args: [order.affiliate_id],
  })
  if (affiliateResult.rows.length === 0) return

  const affiliate = affiliateResult.rows[0] as any
  const commissionCents = Math.round((order.amount_cents * Number(order.affiliate_commission_pct)) / 100)

  const deviceResult = await db.execute({
    sql: 'SELECT device_fingerprint FROM devices WHERE user_id = ? ORDER BY registered_at DESC LIMIT 1',
    args: [order.user_id],
  })
  const visitorFp = (deviceResult.rows[0] as any)?.device_fingerprint || 'unknown'

  const conversionId = generateId()
  await db.execute({
    sql: `INSERT INTO affiliate_conversions (id, affiliate_id, visitor_fp, order_id, commission_cents, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
    args: [conversionId, affiliate.id, visitorFp, orderId, commissionCents],
  })

  await db.execute({
    sql: 'UPDATE affiliates SET balance_pending_cents = balance_pending_cents + ? WHERE id = ?',
    args: [commissionCents, affiliate.id],
  })
}

export async function confirmAffiliateCommission(orderId: string): Promise<void> {
  const orderResult = await db.execute({
    sql: 'SELECT affiliate_id FROM orders WHERE id = ? AND status = ?',
    args: [orderId, 'approved'],
  })
  if (orderResult.rows.length === 0) return

  const order = orderResult.rows[0] as any
  if (!order.affiliate_id) return

  const affiliateResult = await db.execute({
    sql: 'SELECT id FROM affiliates WHERE user_id = ?',
    args: [order.affiliate_id],
  })
  if (affiliateResult.rows.length === 0) return

  const affiliate = affiliateResult.rows[0] as any

  const conversionResult = await db.execute({
    sql: `SELECT id, commission_cents FROM affiliate_conversions
          WHERE order_id = ? AND status = 'pending'`,
    args: [orderId],
  })
  if (conversionResult.rows.length === 0) return

  const conversion = conversionResult.rows[0] as any

  await db.execute({
    sql: `UPDATE affiliate_conversions
          SET status = 'paid', confirmed_at = datetime('now')
          WHERE id = ?`,
    args: [conversion.id],
  })

  await db.execute({
    sql: `UPDATE affiliates
          SET balance_cents = balance_cents + ?,
              balance_pending_cents = MAX(0, balance_pending_cents - ?)
          WHERE id = ?`,
    args: [conversion.commission_cents, conversion.commission_cents, affiliate.id],
  })
}

export async function validateCoupon(
  code: string,
  productId?: string,
  amountCents: number = 0
): Promise<{
  valid: boolean
  coupon?: { id: string; code: string; discount_type: string; discount_value: number }
  discount_cents?: number
  final_price_cents?: number
  error?: string
}> {
  if (!code) {
    return { valid: false, error: 'Código é obrigatório' }
  }

  const result = await db.execute({
    sql: `SELECT * FROM coupons
          WHERE code = ? AND is_active = 1
          AND (valid_from IS NULL OR valid_from <= datetime('now'))
          AND (valid_until IS NULL OR valid_until >= datetime('now'))
          AND (product_id IS NULL OR product_id = ?)
          AND (max_uses IS NULL OR used_count < max_uses)
          LIMIT 1`,
    args: [code.toUpperCase(), productId || null],
  })

  if (result.rows.length === 0) {
    return { valid: false, error: 'Cupom inválido ou expirado' }
  }

  const coupon = result.rows[0] as any
  let discountCents = 0

  if (coupon.discount_type === 'percentage') {
    discountCents = Math.round((amountCents * coupon.discount_value) / 100)
  } else {
    discountCents = coupon.discount_value
  }

  const finalPrice = Math.max(0, amountCents - discountCents)

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
    },
    discount_cents: discountCents,
    final_price_cents: finalPrice,
  }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
    args: [couponId],
  })
}

export async function logAudit(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await db.execute({
    sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      generateId(),
      userId,
      action,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || 'unknown',
    ],
  })
}

export async function logError(
  source: string,
  message: string,
  stack?: string,
  userId?: string,
  url?: string,
  context?: Record<string, any>
): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO errors (id, source, message, stack, user_id, url, context, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        generateId(),
        source,
        message,
        stack || null,
        userId || null,
        url || null,
        context ? JSON.stringify(context) : null,
      ],
    })
  } catch (e) {
    console.error('Failed to log error to DB:', e)
  }
}
