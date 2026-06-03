#!/usr/bin/env node
/**
 * Script de inicialização local - roda schema + admin + demo no SQLite local
 * Use: npx tsx src/lib/init-local-db.ts
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db'
const authToken = process.env.TURSO_AUTH_TOKEN || ''
const db = createClient({ url, authToken })

async function main() {
  console.log('🚀 WORKSHOP Platform - Inicialização Local')
  console.log('==========================================')
  console.log(`📦 Database: ${url}`)
  console.log('')

  console.log('📋 [1/3] Aplicando schema...')
  const schemaPath = join(process.cwd(), '..', 'supabase', 'migrations', '005_sqlite_unified.sql')
  let schema: string
  try {
    schema = readFileSync(schemaPath, 'utf-8')
  } catch (e) {
    console.error('❌ Não encontrei schema em', schemaPath)
    process.exit(1)
  }

  schema = schema
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')

  const statements = schema
    .split(/;[\s\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  let applied = 0
  for (const stmt of statements) {
    try {
      await db.execute(stmt + ';')
      applied++
    } catch (e: any) {
      const msg = String(e.message || '')
      if (!msg.includes('already exists') && !msg.includes('duplicate')) {
        console.warn('⚠️  Statement ignorado:', msg.substring(0, 100))
      }
    }
  }
  console.log(`   ✓ Schema aplicado (${applied} statements)`)
  console.log('')

  console.log('👤 [2/3] Criando admin...')
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: ['alvarobiano@workshop.com'],
  })

  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash('AeSm1979@#', 10)
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, full_name, role, is_active, must_change_password, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'super_admin', 1, 0, datetime('now'), datetime('now'))`,
      args: [crypto.randomUUID(), 'alvarobiano@workshop.com', hash, 'Álvaro Biano'],
    })
    console.log('   ✓ Admin criado')
  } else {
    console.log('   ✓ Admin já existe')
  }
  console.log('')

  console.log('📚 [3/3] Criando produto demo...')
  const productExisting = await db.execute({
    sql: "SELECT id FROM products WHERE slug = ?",
    args: ['workshop-transformacao-financeira'],
  })

  if (productExisting.rows.length === 0) {
    const productId = crypto.randomUUID()
    const module1Id = crypto.randomUUID()
    const module2Id = crypto.randomUUID()
    const lesson1Id = crypto.randomUUID()
    const lesson2Id = crypto.randomUUID()
    const lesson3Id = crypto.randomUUID()
    const lesson4Id = crypto.randomUUID()

    await db.execute({
      sql: `INSERT INTO products
            (id, title, slug, description, price_cents, type, status, is_affiliable, affiliate_commission_pct, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'workshop', 'published', 1, 40, 1, datetime('now'), datetime('now'))`,
      args: [productId, 'Workshop Transformação Financeira', 'workshop-transformacao-financeira',
        'Programa completo de transformação financeira com 8 módulos práticos.', 49700],
    })

    await db.execute({
      sql: `INSERT INTO modules (id, product_id, title, slug, description, sort_order, is_active, created_at)
            VALUES (?, ?, 'Fundamentos Financeiros', 'fundamentos-financeiros', 'Conceitos essenciais', 1, 1, datetime('now'))`,
      args: [module1Id, productId],
    })
    await db.execute({
      sql: `INSERT INTO modules (id, product_id, title, slug, description, sort_order, is_active, created_at)
            VALUES (?, ?, 'Mentalidade de Crescimento', 'mentalidade-crescimento', 'Transforme sua relação com dinheiro', 2, 1, datetime('now'))`,
      args: [module2Id, productId],
    })

    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Bem-vindo ao Workshop', 'bem-vindo', 'video', 300, 1, 1, datetime('now'))`,
      args: [lesson1Id, module1Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Diagnóstico Financeiro', 'diagnostico', 'video', 900, 2, 1, datetime('now'))`,
      args: [lesson2Id, module1Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Sua Relação com o Dinheiro', 'relacao-dinheiro', 'video', 720, 1, 1, datetime('now'))`,
      args: [lesson3Id, module2Id],
    })
    await db.execute({
      sql: `INSERT INTO lessons (id, module_id, title, slug, type, duration_sec, sort_order, is_active, created_at)
            VALUES (?, ?, 'Crenças Limitantes', 'crencas', 'video', 1080, 2, 1, datetime('now'))`,
      args: [lesson4Id, module2Id],
    })

    console.log('   ✓ Produto demo criado com 2 módulos e 4 aulas')
  } else {
    console.log('   ✓ Produto demo já existe')
  }

  console.log('')
  console.log('✅ Banco local pronto!')
  console.log('')
  console.log('Para iniciar o app, em outro terminal:')
  console.log('  npm run dev')
  console.log('')
  console.log('Acesse: http://localhost:4321')
  console.log('Login: alvarobiano@workshop.com / AeSm1979@#')
}

main().catch(e => {
  console.error('Erro:', e)
  process.exit(1)
})
