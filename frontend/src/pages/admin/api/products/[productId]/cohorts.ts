import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies, isAdmin } from '@lib/auth'

export const GET: APIRoute = async ({ cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId } = params

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM cohorts WHERE product_id = ? ORDER BY created_at DESC',
      args: [productId],
    })

    return new Response(JSON.stringify({ cohorts: result.rows }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar turmas' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { productId } = params
  const { name, description, start_date, end_date, max_students } = await request.json()

  try {
    const id = crypto.randomUUID()
    await db.execute({
      sql: `INSERT INTO cohorts (id, product_id, name, description, start_date, end_date, max_students)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, productId, name, description || null, start_date || null, end_date || null, max_students || null],
    })

    return new Response(JSON.stringify({ success: true, cohort: { id, name } }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao criar turma' }), { status: 500 })
  }
}
