import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies } from '@lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const affiliateResult = await db.execute({
    sql: 'SELECT * FROM affiliates WHERE user_id = ?',
    args: [session.profile.id],
  })

  if (affiliateResult.rows.length === 0) {
    return new Response('Não é afiliado', { status: 404 })
  }

  const affiliate = affiliateResult.rows[0] as any

  const clicksResult = await db.execute({
    sql: 'SELECT * FROM affiliate_clicks WHERE affiliate_id = ? ORDER BY clicked_at DESC',
    args: [affiliate.id],
  })

  const conversionsResult = await db.execute({
    sql: `SELECT ac.*, o.order_number, p.title as product_title
          FROM affiliate_conversions ac
          INNER JOIN orders o ON ac.order_id = o.id
          INNER JOIN products p ON o.product_id = p.id
          WHERE ac.affiliate_id = ?
          ORDER BY ac.created_at DESC`,
    args: [affiliate.id],
  })

  const withdrawalsResult = await db.execute({
    sql: 'SELECT * FROM affiliate_withdrawals WHERE affiliate_id = ? ORDER BY requested_at DESC',
    args: [affiliate.id],
  })

  const headers = [
    'id', 'visitor_fp', 'ip', 'user_agent', 'referrer', 'landing_url', 'clicked_at',
  ]
  const csv = [
    headers.join(','),
    ...clicksResult.rows.map((c: any) => headers.map(h => `"${(c[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cliques-${affiliate.code}-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
