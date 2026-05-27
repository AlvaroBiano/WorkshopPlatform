import type { APIContext } from 'astro'
import { getSessionFromCookies, isAdmin } from './lib/auth'

const PUBLIC_ROUTES = ['/', '/login', '/cadastro', '/recuperar-senha', '/first-access']
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

  const session = await getSessionFromCookies(context.cookies)

  if (!session?.profile) {
    if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) ||
        STUDENT_ROUTES.some(r => pathname.startsWith(r)) ||
        AFFILIATE_ROUTES.some(r => pathname.startsWith(r))) {
      return context.redirect('/login')
    }
    return next()
  }

  if (session.profile.banned_at) {
    return context.redirect('/login?error=banned')
  }

  if (!session.profile.is_active) {
    return context.redirect('/login?error=inactive')
  }

  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && !isAdmin(session.profile)) {
    return context.redirect('/student')
  }

  context.locals.user = session.profile
  context.locals.authUser = session.user

  return next()
}
