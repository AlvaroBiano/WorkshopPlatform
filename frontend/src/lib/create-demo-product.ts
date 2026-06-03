import { db, generateId, slugify } from './turso'

async function createDemoProduct() {
  const productId = generateId()
  const module1Id = generateId()
  const module2Id = generateId()
  const lesson1Id = generateId()
  const lesson2Id = generateId()
  const lesson3Id = generateId()
  const lesson4Id = generateId()

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ?",
      args: ['workshop-transformacao-financeira'],
    })
    if (existing.rows.length > 0) {
      console.log('Produto demo já existe. Pulando.')
      return
    }

    await db.execute({
      sql: `INSERT INTO products
            (id, title, slug, description, cover_url, price_cents, type, status, is_affiliable, affiliate_commission_pct, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'workshop', 'published', 1, 40, 1, datetime('now'), datetime('now'))`,
      args: [
        productId,
        'Workshop Transformação Financeira',
        'workshop-transformacao-financeira',
        'Programa completo de transformação financeira com 8 módulos práticos. Aprenda a organizar suas finanças, investir com inteligência e construir riqueza sustentável.',
        null,
        49700,
      ],
    })
    console.log('✅ Produto criado:', productId)

    await db.execute({
      sql: `INSERT INTO modules (id, product_id, title, slug, description, sort_order, is_active, created_at)
            VALUES (?, ?, 'Fundamentos Financeiros', 'fundamentos-financeiros', 'Conceitos essenciais para começar', 1, 1, datetime('now'))`,
      args: [module1Id, productId],
    })
    await db.execute({
      sql: `INSERT INTO modules (id, product_id, title, slug, description, sort_order, is_active, created_at)
            VALUES (?, ?, 'Mentalidade de Crescimento', 'mentalidade-crescimento', 'Transforme sua relação com dinheiro', 2, 1, datetime('now'))`,
      args: [module2Id, productId],
    })
    console.log('✅ Módulos criados')

    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Bem-vindo ao Workshop', 'bem-vindo', 'video', 300, 1, 1, datetime('now'))`,
      args: [lesson1Id, module1Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Diagnóstico Financeiro', 'diagnostico-financeiro', 'video', 900, 2, 1, datetime('now'))`,
      args: [lesson2Id, module1Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Sua Relação com o Dinheiro', 'relacao-dinheiro', 'video', 720, 1, 1, datetime('now'))`,
      args: [lesson3Id, module2Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Crenças Limitantes', 'crencas-limitantes', 'video', 1080, 2, 1, datetime('now'))`,
      args: [lesson4Id, module2Id],
    })
    console.log('✅ Aulas criadas')

    console.log('🎉 Produto demo criado com sucesso!')
    console.log(`   ID: ${productId}`)
    console.log(`   Slug: workshop-transformacao-financeira`)
  } catch (err) {
    console.error('❌ Erro ao criar produto demo:', err)
  }
}

createDemoProduct()
