import type { APIRoute } from 'astro'
import { db } from '../../lib/turso'
import { getSessionFromCookies } from '../../lib/auth'
import bcrypt from 'bcryptjs'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { new_password } = await request.json()

    if (!new_password || new_password.length < 8) {
      return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 8 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const password_hash = await bcrypt.hash(new_password, 10)

    await db.execute({
      sql: "UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = datetime('now') WHERE id = ?",
      args: [password_hash, session.profile.id],
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro ao trocar senha:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar senha' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
