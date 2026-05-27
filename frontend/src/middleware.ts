import type { APIContext } from 'astro'
import { verifyToken, getUserProfile, isAdmin } from './lib/auth'

const PUBLIC_ROUTES = ['/', '/login', '/cadastro', '/recuperar-senha', '/first-access', '/logout', '/termos', '/privacidade', '/suporte']
const ADMIN_ROUTES = ['/admin']
const STUDENT_ROUTES = ['/student']
const AFFILIATE_ROUTES = ['/affiliate']

export async function onRequest(context: APIContext, next: () => Promise<Response>) {
  const { pathname } = context.url

  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith('/api/'))) {
    return next()
  }

  if (pathname.startsWith('/_') || pathname.includes('.')) {
    return next()
  }

  const token = context.cookies.get('sb-access-token')?.value

  if (!token) {
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) ||
        STUDENT_ROUTES.some(r => pathname.startsWith(r)) ||
        AFFILIATE_ROUTES.some(r => pathname.startsWith(r))) {
      return context.redirect('/login')
    }
    return next()
  }

  const basicProfile = verifyToken(token)
  if (!basicProfile) {
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) ||
        STUDENT_ROUTES.some(r => pathname.startsWith(r)) ||
        AFFILIATE_ROUTES.some(r => pathname.startsWith(r))) {
      return context.redirect('/login')
    }
    return next()
  }

  const profile = await getUserProfile(basicProfile.id)

  if (!profile) {
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) ||
        STUDENT_ROUTES.some(r => pathname.startsWith(r)) ||
        AFFILIATE_ROUTES.some(r => pathname.startsWith(r))) {
      return context.redirect('/login')
    }
    return next()
  }

  if (profile.banned_at) {
    return context.redirect('/login?error=banned')
  }

  if (!profile.is_active) {
    return context.redirect('/login?error=inactive')
  }

  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && !isAdmin(profile)) {
    return context.redirect('/student')
  }

  context.locals.user = profile

  return next()
}
