import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies } from '@lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { amountCents } = await request.json()
  if (!amountCents || amountCents < 10000) {
    return new Response('Valor mínimo: R$ 100', { status: 400 })
  }

  const affiliateRows = await db.execute({
    sql: 'SELECT * FROM affiliates WHERE user_id = ?',
    args: [session.profile.id],
  })
  const affiliate = affiliateRows.rows[0]

  if (!affiliate) {
    return new Response('Afiliado não encontrado', { status: 404 })
  }

  if (affiliate.balance_cents < amountCents) {
    return new Response('Saldo insuficiente', { status: 400 })
  }

  const withdrawalId = crypto.randomUUID()
  await db.execute({
    sql: 'INSERT INTO affiliate_withdrawals (id, affiliate_id, amount_cents, pix_key, status) VALUES (?, ?, ?, ?, ?)',
    args: [withdrawalId, affiliate.id, amountCents, affiliate.pix_key, 'requested'],
  })

  await db.execute({
    sql: 'UPDATE affiliates SET balance_cents = ? WHERE id = ?',
    args: [affiliate.balance_cents - amountCents, affiliate.id],
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
