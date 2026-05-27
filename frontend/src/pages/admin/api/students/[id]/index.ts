import type { APIRoute } from 'astro'
import { db } from '../../../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../../../lib/auth'
import bcrypt from 'bcryptjs'

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
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aluno não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ student: result.rows[0] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    return new Response(JSON.stringify({ error: 'Erro ao buscar aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

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
    const { email, full_name, is_active, must_change_password, password } = await request.json()

    const existingUser = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    if (existingUser.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Aluno não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (email) {
      const emailCheck = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
        args: [email, id],
      })

      if (emailCheck.rows.length > 0) {
        return new Response(JSON.stringify({ error: 'Email já está em uso' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    const updates: string[] = []
    const args: any[] = []

    if (email !== undefined) {
      updates.push('email = ?')
      args.push(email)
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?')
      args.push(full_name)
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      args.push(is_active ? 1 : 0)
    }
    if (must_change_password !== undefined) {
      updates.push('must_change_password = ?')
      args.push(must_change_password ? 1 : 0)
    }
    if (password) {
      if (password.length < 8) {
        return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 8 caracteres' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const password_hash = await bcrypt.hash(password, 10)
      updates.push('password_hash = ?')
      args.push(password_hash)
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum campo para atualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    updates.push("updated_at = datetime('now')")
    args.push(id)

    await db.execute({
      sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UPDATE_STUDENT', 'users', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        id,
        JSON.stringify({ email, full_name, is_active, must_change_password }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    const updatedStudent = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    })

    return new Response(JSON.stringify({
      success: true,
      student: updatedStudent.rows[0],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar aluno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
