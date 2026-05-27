import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-server'

export interface UserProfile {
  id: string
  auth_id: string | null
  full_name: string
  email: string
  whatsapp: string | null
  role: string
  avatar_url: string | null
  first_login: boolean
  must_change_password: boolean
  is_active: boolean
  banned_at: string | null
  ban_reason: string | null
  created_at: string
  last_login_at: string | null
}

export async function getSessionFromCookies(cookies: { get: (name: string) => { value: string } | undefined }) {
  const accessToken = cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken)
    if (error || !user) return null

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    return { user, profile: profile as UserProfile | null }
  } catch {
    return null
  }
}

export async function getUserProfile(authId: string): Promise<UserProfile | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single()

  return data as UserProfile | null
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

export async function signOutClient() {
  await supabase.auth.signOut()
  document.cookie = 'sb-access-token=; path=/; max-age=0'
  document.cookie = 'sb-refresh-token=; path=/; max-age=0'
}
