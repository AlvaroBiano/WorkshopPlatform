import type { APIRoute } from 'astro'
import { db } from '../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const [
      totalRevenueResult,
      monthRevenueResult,
      pendingOrdersResult,
      approvedTodayResult,
    ] = await Promise.all([
      db.execute(`
        SELECT SUM(amount_cents) as total 
        FROM orders 
        WHERE status = 'approved'
      `),
      db.execute(`
        SELECT SUM(amount_cents) as total 
        FROM orders 
        WHERE status = 'approved' 
        AND created_at >= date('now', 'start of month')
      `),
      db.execute(`
        SELECT COUNT(*) as count, SUM(amount_cents) as total
        FROM orders 
        WHERE status = 'pending'
      `),
      db.execute(`
        SELECT COUNT(*) as count, SUM(amount_cents) as total
        FROM orders 
        WHERE status = 'approved' 
        AND date(created_at) = date('now')
      `),
    ])

    return new Response(JSON.stringify({
      total_revenue_cents: Number((totalRevenueResult.rows[0] as any)?.total || 0),
      month_revenue_cents: Number((monthRevenueResult.rows[0] as any)?.total || 0),
      pending_orders_count: Number((pendingOrdersResult.rows[0] as any)?.count || 0),
      pending_amount_cents: Number((pendingOrdersResult.rows[0] as any)?.total || 0),
      approved_today_count: Number((approvedTodayResult.rows[0] as any)?.count || 0),
      approved_today_amount_cents: Number((approvedTodayResult.rows[0] as any)?.total || 0),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching financial overview:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar visão geral' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
