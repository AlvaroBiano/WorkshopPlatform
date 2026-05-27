import type { APIRoute } from 'astro'
import { db } from '../../lib/turso'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { full_name, email, cpf, whatsapp, desired_product_id, payment_proof_url, affiliate_code } = await request.json()

    if (!full_name || !email) {
      return new Response(JSON.stringify({ error: 'Nome e email são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM pending_registrations WHERE email = ? AND status = ?',
      args: [email.toLowerCase(), 'pending'],
    })

    if (existing.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Já existe um cadastro pendente com este email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    })

    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Este email já está cadastrado. Tente fazer login.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (cpf && cpf.length !== 11) {
      return new Response(JSON.stringify({ error: 'CPF deve ter 11 dígitos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = crypto.randomUUID()

    await db.execute({
      sql: `INSERT INTO pending_registrations (id, full_name, email, cpf, whatsapp, desired_product_id, payment_proof_url, affiliate_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, full_name, email.toLowerCase(), cpf || null, whatsapp || null, desired_product_id || null, payment_proof_url || null, affiliate_code || null],
    })

    return new Response(JSON.stringify({ success: true, message: 'Cadastro enviado com sucesso! Aguarde a aprovação do administrador.' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return new Response(JSON.stringify({ error: 'Erro ao processar cadastro' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
