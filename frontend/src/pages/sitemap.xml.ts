import type { APIRoute } from 'astro'
import { db } from '../lib/turso'

export const GET: APIRoute = async () => {
  const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321'

  const staticPages = [
    '',
    '/cadastro',
    '/recuperar-senha',
    '/termos',
    '/privacidade',
    '/suporte',
  ]

  let products: any[] = []
  try {
    const result = await db.execute({
      sql: "SELECT slug, updated_at FROM products WHERE status = 'published' ORDER BY updated_at DESC",
      args: [],
    })
    products = result.rows as any[]
  } catch (e) {
    console.error('Sitemap product query failed:', e)
  }

  const urls: { loc: string; lastmod?: string; priority: string }[] = []

  for (const p of staticPages) {
    urls.push({ loc: `${baseUrl}${p}`, priority: p === '' ? '1.0' : '0.6' })
  }

  for (const p of products) {
    urls.push({
      loc: `${baseUrl}/produto/${p.slug}`,
      lastmod: p.updated_at || p.created_at,
      priority: '0.8',
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
