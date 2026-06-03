#!/usr/bin/env node
/**
 * Script de teste manual - execute após setup-db.sh
 * Requer: npm install + node + .env com TURSO_DATABASE_URL e TURSO_AUTH_TOKEN
 */
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db'
const authToken = process.env.TURSO_AUTH_TOKEN || ''

if (!url) {
  console.error('❌ Defina TURSO_DATABASE_URL ou use file:./local.db')
  process.exit(1)
}

const db = createClient({ url, authToken })

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`)
    failed++
  }
}

async function main() {
  console.log('🧪 WORKSHOP Platform - Test Suite\n')

  await test('Conexão com Turso', async () => {
    const r = await db.execute('SELECT 1 as ok')
    if (r.rows.length === 0) throw new Error('Sem resposta')
  })

  await test('Tabela users existe', async () => {
    const r = await db.execute('SELECT COUNT(*) as count FROM users')
    if (!r.rows[0]) throw new Error('Tabela vazia')
  })

  await test('Tabela products existe', async () => {
    await db.execute('SELECT COUNT(*) FROM products')
  })

  await test('Tabela orders existe', async () => {
    await db.execute('SELECT COUNT(*) FROM orders')
  })

  await test('Tabela coupons existe', async () => {
    await db.execute('SELECT COUNT(*) FROM coupons')
  })

  await test('Tabela modules existe', async () => {
    await db.execute('SELECT COUNT(*) FROM modules')
  })

  await test('Tabela lessons existe', async () => {
    await db.execute('SELECT COUNT(*) FROM lessons')
  })

  await test('Tabela affiliates existe', async () => {
    await db.execute('SELECT COUNT(*) FROM affiliates')
  })

  await test('Tabela affiliate_clicks existe', async () => {
    await db.execute('SELECT COUNT(*) FROM affiliate_clicks')
  })

  await test('Tabela reviews existe', async () => {
    await db.execute('SELECT COUNT(*) FROM reviews')
  })

  await test('Tabela comments existe', async () => {
    await db.execute('SELECT COUNT(*) FROM comments')
  })

  await test('Tabela cohorts existe', async () => {
    await db.execute('SELECT COUNT(*) FROM cohorts')
  })

  await test('Tabela notifications existe', async () => {
    await db.execute('SELECT COUNT(*) FROM notifications')
  })

  await test('Tabela pending_registrations existe', async () => {
    await db.execute('SELECT COUNT(*) FROM pending_registrations')
  })

  await test('Tabela audit_logs existe', async () => {
    await db.execute('SELECT COUNT(*) FROM audit_logs')
  })

  await test('Tabela settings existe e tem platform', async () => {
    const r = await db.execute("SELECT value FROM settings WHERE key = 'platform'")
    if (r.rows.length === 0) throw new Error('Setting platform não encontrado')
  })

  await test('Admin user existe', async () => {
    const r = await db.execute("SELECT email FROM users WHERE role = 'admin' OR role = 'super_admin' LIMIT 1")
    if (r.rows.length === 0) throw new Error('Nenhum admin')
  })

  await test('bcrypt hash funciona', async () => {
    const hash = await bcrypt.hash('test123', 10)
    const ok = await bcrypt.compare('test123', hash)
    if (!ok) throw new Error('bcrypt inválido')
  })

  console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(e => {
  console.error('Erro fatal:', e)
  process.exit(1)
})
