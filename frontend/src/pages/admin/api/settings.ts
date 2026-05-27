import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies, isAdmin } from '../../../lib/auth'

export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const settingsResult = await db.execute(`
      SELECT * FROM settings ORDER BY key ASC
    `)

    const settings: Record<string, any> = {}
    settingsResult.rows.forEach((row: any) => {
      settings[row.key] = {
        value: row.value,
        description: row.description,
      }
    })

    return new Response(JSON.stringify({ settings }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return new Response(JSON.stringify({ error: 'Erro ao carregar configurações' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return new Response(JSON.stringify({ error: 'settings deve ser um objeto' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.execute({
        sql: `
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')
        `,
        args: [key, String(value), String(value)],
      })
    }

    await db.execute({
      sql: `
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
        VALUES (?, ?, 'UPDATE_SETTINGS', 'settings', ?, ?, ?, datetime('now'))
      `,
      args: [
        crypto.randomUUID(),
        session.profile.id,
        'settings',
        JSON.stringify({ keys: Object.keys(settings) }),
        request.headers.get('x-forwarded-for') || 'unknown',
      ],
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Configurações atualizadas com sucesso',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return new Response(JSON.stringify({ error: 'Erro ao atualizar configurações' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
