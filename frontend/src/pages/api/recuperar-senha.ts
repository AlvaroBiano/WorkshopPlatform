import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, cpf } = await request.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userResult = await db.execute({
      sql: 'SELECT id, cpf FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    })

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Se o email estiver cadastrado, a senha será resetada para o CPF.' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const user = userResult.rows[0] as any
    const resetPassword = cpf || user.cpf || '12345678'

    if (resetPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'CPF deve ter no mínimo 8 dígitos para ser usado como senha' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const password_hash = await bcrypt.hash(resetPassword, 10)

    await db.execute({
      sql: "UPDATE users SET password_hash = ?, must_change_password = 1, updated_at = datetime('now') WHERE id = ?",
      args: [password_hash, user.id],
    })

    return new Response(JSON.stringify({ success: true, message: 'Senha resetada com sucesso! Sua nova senha é seu CPF. Faça login e troque-a no primeiro acesso.' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro ao recuperar senha:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
