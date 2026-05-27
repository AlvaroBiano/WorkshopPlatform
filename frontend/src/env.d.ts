/// <reference path="../.astro/types.d.ts" />

interface UserProfile {
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

declare namespace App {
  interface Locals {
    user?: UserProfile
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_APP_NAME: string
  readonly PUBLIC_APP_SUBTITLE: string
  readonly PUBLIC_SITE_URL: string
  readonly AFFILIATE_COOKIE_DAYS: string
  readonly VIMEO_ACCESS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
