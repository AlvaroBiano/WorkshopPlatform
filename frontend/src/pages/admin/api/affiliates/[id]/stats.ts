import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ cookies, params }) => {
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
    const affiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    if (affiliate.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Afiliado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const [clicksResult, conversionsResult, withdrawalsResult] = await Promise.all([
      db.execute({
        sql: 'SELECT COUNT(*) as total FROM affiliate_clicks WHERE affiliate_id = ?',
        args: [id],
      }),
      db.execute({
        sql: `
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'paid' THEN commission_cents ELSE 0 END) as paid_cents,
            SUM(CASE WHEN status = 'pending' THEN commission_cents ELSE 0 END) as pending_cents
          FROM affiliate_conversions 
          WHERE affiliate_id = ?
        `,
        args: [id],
      }),
      db.execute({
        sql: `
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) as paid_cents,
            SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END) as pending_cents
          FROM affiliate_withdrawals 
          WHERE affiliate_id = ?
        `,
        args: [id],
      }),
    ])

    const clicks = Number((clicksResult.rows[0] as any)?.total || 0)
    const conversions = Number((conversionsResult.rows[0] as any)?.total || 0)
    const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00'

    return new Response(JSON.stringify({
      clicks,
      conversions,
      conversion_rate: parseFloat(conversionRate),
      total_earned_cents: Number((conversionsResult.rows[0] as any)?.paid_cents || 0) + Number((conversionsResult.rows[0] as any)?.pending_cents || 0),
      total_paid_cents: Number((conversionsResult.rows[0] as any)?.paid_cents || 0),
      total_pending_cents: Number((conversionsResult.rows[0] as any)?.pending_cents || 0),
      total_withdrawn_cents: Number((withdrawalsResult.rows[0] as any)?.paid_cents || 0),
      pending_withdrawals_cents: Number((withdrawalsResult.rows[0] as any)?.pending_cents || 0),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar estatísticas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
