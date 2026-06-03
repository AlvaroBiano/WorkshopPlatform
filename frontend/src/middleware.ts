import type { APIContext } from 'astro'
import { verifyToken, getUserProfile, isAdmin } from './lib/auth'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/first-access',
  '/logout',
  '/termos',
  '/privacidade',
  '/suporte',
  '/produto',
  '/checkout',
  '/workshop',
]
const ADMIN_ROUTES = ['/admin']
const STUDENT_ROUTES = ['/student']
const AFFILIATE_ROUTES = ['/affiliate']

function getDashboardUrl(role: string): string {
  if (role === 'admin' || role === 'super_admin') return '/admin'
  if (role === 'affiliate') return '/affiliate/dashboard'
  return '/student'
}

function redirectToLogin(pathname: string, cookies: APIContext['cookies']): Response {
  const isApiRoute = pathname.startsWith('/api/') || pathname.startsWith('/admin/api/') || pathname.startsWith('/student/api/') || pathname.startsWith('/affiliate/api/')
  if (isApiRoute) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/login?redirect=${encodeURIComponent(pathname)}`,
    },
  })
}

function isProtectedRoute(pathname: string): boolean {
  return (
    ADMIN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    STUDENT_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    AFFILIATE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  )
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function isStudentRoute(pathname: string): boolean {
  return STUDENT_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function isAffiliateRoute(pathname: string): boolean {
  return AFFILIATE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export async function onRequest(context: APIContext, next: () => Promise<Response>) {
  const { pathname } = context.url

  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return next()
  }

  if (pathname.startsWith('/_') || pathname.startsWith('/.') || pathname.includes('.')) {
    return next()
  }

  const token = context.cookies.get('sb-access-token')?.value

  if (!token) {
    if (isProtectedRoute(pathname)) {
      return redirectToLogin(pathname, context.cookies)
    }
    return next()
  }

  const basicProfile = verifyToken(token)
  if (!basicProfile) {
    if (isProtectedRoute(pathname)) {
      return redirectToLogin(pathname, context.cookies)
    }
    return next()
  }

  const profile = await getUserProfile(basicProfile.id)
  if (!profile) {
    if (isProtectedRoute(pathname)) {
      return redirectToLogin(pathname, context.cookies)
    }
    return next()
  }

  if (profile.banned_at) {
    if (isProtectedRoute(pathname) || pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?error=banned' },
      })
    }
    return next()
  }

  if (!profile.is_active) {
    if (isProtectedRoute(pathname) || pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?error=inactive' },
      })
    }
    return next()
  }

  if (profile.must_change_password && !pathname.startsWith('/first-access') && !pathname.startsWith('/logout')) {
    if (isProtectedRoute(pathname) || pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/first-access' },
      })
    }
    return next()
  }

  if (isAdminRoute(pathname) && !isAdmin(profile)) {
    return new Response(null, {
      status: 302,
      headers: { Location: getDashboardUrl(profile.role) },
    })
  }

  if (isAffiliateRoute(pathname) && profile.role !== 'affiliate') {
    return new Response(null, {
      status: 302,
      headers: { Location: getDashboardUrl(profile.role) },
    })
  }

  if (isStudentRoute(pathname) && profile.role !== 'student' && !isAdmin(profile)) {
    return new Response(null, {
      status: 302,
      headers: { Location: getDashboardUrl(profile.role) },
    })
  }

  context.locals.user = profile

  return next()
}
