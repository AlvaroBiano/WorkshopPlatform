import type { APIRoute } from 'astro'
import { db } from '@lib/turso'
import { getSessionFromCookies } from '@lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies)
  if (!session?.profile) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Apenas imagens são permitidas' }), { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande (máx 5MB)' }), { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const id = crypto.randomUUID()

    await db.execute({
      sql: `INSERT INTO attachments (id, filename, mime_type, size_bytes, data, storage_type, uploaded_by, created_at)
            VALUES (?, ?, ?, ?, ?, 'database', ?, datetime('now'))`,
      args: [id, file.name, file.type, file.size, base64, session.profile.id],
    })

    const dataUrl = `data:${file.type};base64,${base64}`

    return new Response(JSON.stringify({
      success: true,
      attachment: {
        id,
        url: dataUrl,
        filename: file.name,
        size: file.size,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return new Response(JSON.stringify({ error: 'Erro ao fazer upload' }), { status: 500 })
  }
}
