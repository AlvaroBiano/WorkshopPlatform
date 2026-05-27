import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.warn('Missing Turso environment variables', { url: !!url, authToken: !!authToken })
}

export const db = createClient({
  url: url || 'file:local.db',
  authToken: authToken || '',
})
