import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { email, password, full_name, must_change_password = true } = await request.json()

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 8 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    })

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Email já cadastrado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = crypto.randomUUID()
    const password_hash = await bcrypt.hash(password, 10)

    await db.execute({
      sql: `
        INSERT INTO users (id, email, password_hash, full_name, role, is_active, must_change_password, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'student', 1, ?, datetime('now'), datetime('now'))
      `,
      args: [id, email, password_hash, full_name, must_change_password ? 1 : 0],
    })

    const newStudent = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'CREATE_STUDENT', 'users', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ email, full_name }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      student: newStudent.rows[0],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating student:', error)
    return new Response(JSON.stringify({ error: 'Erro ao criar aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
