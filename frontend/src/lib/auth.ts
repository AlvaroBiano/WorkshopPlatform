import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './turso'

const JWT_SECRET = process.env.JWT_SECRET || import.meta.env.JWT_SECRET || 'dev-secret-change-in-production'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  must_change_password: boolean
  banned_at: string | null
  ban_reason: string | null
  last_login_at: string | null
  created_at: string
}

export async function authenticateUser(email: string, password: string): Promise<UserProfile | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  })

  if (result.rows.length === 0) return null

  const user = result.rows[0] as any
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return null

  await db.execute({
    sql: "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
    args: [user.id],
  })

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    is_active: Boolean(user.is_active),
    must_change_password: Boolean(user.must_change_password),
    banned_at: user.banned_at,
    ban_reason: user.ban_reason,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  }
}

export function generateToken(profile: UserProfile): string {
  return jwt.sign(
    {
      sub: profile.id,
      email: profile.email,
      role: profile.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): UserProfile | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return {
      id: payload.sub,
      email: payload.email,
      full_name: '',
      role: payload.role,
      is_active: true,
      must_change_password: false,
      banned_at: null,
      ban_reason: null,
      last_login_at: null,
      created_at: '',
    }
  } catch {
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [userId],
  })

  if (result.rows.length === 0) return null

  const user = result.rows[0] as any
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    is_active: Boolean(user.is_active),
    must_change_password: Boolean(user.must_change_password),
    banned_at: user.banned_at,
    ban_reason: user.ban_reason,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  }
}

export function isAdmin(profile: UserProfile | null): boolean {
  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

export function isStudent(profile: UserProfile | null): boolean {
  return profile?.role === 'student'
}

export function isAffiliate(profile: UserProfile | null): boolean {
  return profile?.role === 'affiliate'
}

export async function getSessionFromCookies(cookies: { get: (name: string) => { value: string } | undefined }) {
  const token = cookies.get('sb-access-token')?.value
  if (!token) return null

  const basicProfile = verifyToken(token)
  if (!basicProfile) return null

  const profile = await getUserProfile(basicProfile.id)
  if (!profile) return null

  return { profile }
}
