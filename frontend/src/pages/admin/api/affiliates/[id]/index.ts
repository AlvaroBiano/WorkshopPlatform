import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const PUT: APIRoute = async ({ request, cookies, params }) => {
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
    const { commission_pct, is_active } = await request.json()

    const existingAffiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    if (existingAffiliate.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Afiliado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updates: string[] = []
    const args: any[] = []

    if (commission_pct !== undefined) {
      updates.push('commission_pct = ?')
      args.push(commission_pct)
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?')
      args.push(is_active ? 1 : 0)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    args.push(id)

    await db.execute({
      sql: `UPDATE affiliates SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UPDATE_AFFILIATE', 'affiliates', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ commission_pct, is_active }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedAffiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      affiliate: updatedAffiliate.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating affiliate:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar afiliado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
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
    const existingAffiliate = await db.execute({
      sql: 'SELECT * FROM affiliates WHERE id = ?',
      args: [id],
    })

    if (existingAffiliate.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Afiliado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const affiliate = existingAffiliate.rows[0] as any

    await db.execute({
      sql: `UPDATE affiliates SET is_active = 0 WHERE id = ?`,
      args: [id],
    })

    await db.execute({
      sql: `UPDATE users SET role = 'student' WHERE id = ?`,
      args: [affiliate.user_id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'DEACTIVATE_AFFILIATE', 'affiliates', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ user_id: affiliate.user_id }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Afiliado desativado com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deactivating affiliate:', error)
    return new Response(JSON.stringify({ error: 'Erro ao desativar afiliado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
