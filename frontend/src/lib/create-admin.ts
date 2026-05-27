import bcrypt from 'bcryptjs'
import { db } from './turso'

async function createAdmin() {
  const email = 'alvarobiano@workshop.com'
  const password = 'AeSm1979@#'
  const fullName = 'Álvaro Biano'
  const role = 'super_admin'

  const hash = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()

  try {
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, full_name, role, is_active, must_change_password)
            VALUES (?, ?, ?, ?, ?, 1, 0)
            ON CONFLICT(email) DO UPDATE SET
              password_hash = excluded.password_hash,
              full_name = excluded.full_name,
              role = excluded.role,
              is_active = 1,
              must_change_password = 0`,
      args: [id, email, hash, fullName, role],
    })

    console.log('✅ Admin criado/atualizado com sucesso!')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)
  } catch (err) {
    console.error('❌ Erro ao criar admin:', err)
  }
}

createAdmin()
