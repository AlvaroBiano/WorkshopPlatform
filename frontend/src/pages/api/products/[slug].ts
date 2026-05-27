import type { APIRoute } from 'astro'
import { db } from '../../../lib/turso'
import { getSessionFromCookies } from '../../../lib/auth'

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params

  try {
    const productResult = await db.execute({
      sql: `SELECT p.*, 
            (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id AND status = 'approved') as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND status = 'approved') as total_reviews,
            (SELECT COUNT(*) FROM comments WHERE product_id = p.id AND status = 'approved') as total_comments
            FROM products p WHERE p.slug = ? AND p.status = 'published'`,
      args: [slug],
    })

    if (productResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), { status: 404 })
    }

    const product = productResult.rows[0] as any

    const modulesResult = await db.execute({
      sql: `SELECT m.*, COUNT(l.id) as lessons_count 
            FROM modules m LEFT JOIN lessons l ON m.id = l.module_id 
            WHERE m.product_id = ? GROUP BY m.id ORDER BY m.sort_order`,
      args: [product.id],
    })

    const reviewsResult = await db.execute({
      sql: `SELECT r.*, u.full_name FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC LIMIT 5`,
      args: [product.id],
    })

    return new Response(JSON.stringify({
      product,
      modules: modulesResult.rows,
      reviews: reviewsResult.rows,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao carregar produto' }), { status: 500 })
  }
}
