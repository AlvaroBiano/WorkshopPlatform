import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return new Response(JSON.stringify({ error: 'ID é obrigatório' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  try {
    const pendingResult = await db.execute({
      sql: 'SELECT * FROM pending_registrations WHERE id = ?',
      args: [id],
    })

    if (pendingResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Registro não encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    const pending = pendingResult.rows[0] as any

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [pending.email],
    })

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Usuário já existe com este email' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const userId = crypto.randomUUID()
    const initialPassword = pending.cpf || '12345678'
    const password_hash = await bcrypt.hash(initialPassword, 10)

    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, full_name, role, must_change_password, is_active, whatsapp, cpf)
            VALUES (?, ?, ?, ?, 'student', 1, 1, ?, ?)`,
      args: [userId, pending.email, password_hash, pending.full_name, pending.whatsapp || null, pending.cpf || null],
    })

    if (pending.desired_product_id) {
      const productResult = await db.execute({
        sql: 'SELECT price_cents FROM products WHERE id = ?',
        args: [pending.desired_product_id],
      })

      const priceCents = productResult.rows.length > 0 ? (productResult.rows[0] as any).price_cents : 39700

      const orderId = crypto.randomUUID()
      await db.execute({
        sql: `INSERT INTO orders (id, order_number, user_id, product_id, amount_cents, status, approved_at, approved_by)
              VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'), ?)`,
        args: [orderId, `WB-${Date.now()}`, userId, pending.desired_product_id, priceCents, session.profile.id],
      })

      await db.execute({
        sql: `INSERT INTO product_access (id, user_id, product_id, granted_at, granted_by)
              VALUES (?, ?, ?, datetime('now'), ?)`,
        args: [crypto.randomUUID(), userId, pending.desired_product_id, session.profile.id],
      })
    }

    await db.execute({
      sql: `INSERT INTO notifications (id, user_id, type, title, body)
            VALUES (?, ?, 'success', 'Bem-vindo ao Workshop!', ?)`,
      args: [crypto.randomUUID(), userId, `Olá ${pending.full_name}! Seu acesso foi liberado. Sua senha inicial é seu CPF. Recomendamos alterá-la no primeiro acesso.`],
    })

    await db.execute({
      sql: `UPDATE pending_registrations SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?`,
      args: [session.profile.id, id],
    })

    await db.execute({
      sql: `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
            VALUES (?, ?, 'APPROVE_STUDENT', 'pending_registrations', ?, ?, ?, datetime('now'))`,
      args: [crypto.randomUUID(), session.profile.id, id, JSON.stringify({ student_email: pending.email }), request.headers.get('x-forwarded-for') || 'unknown'],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro ao aprovar aluno:', error)
    return new Response(JSON.stringify({ error: 'Erro ao aprovar aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
