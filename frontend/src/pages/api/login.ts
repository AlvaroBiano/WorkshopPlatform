import type { APIRoute } from 'astro'
import { authenticateUser, generateToken } from '@lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('Login attempt started')
    
    const body = await request.json()
    console.log('Request body received:', { email: body.email })
    
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Authenticating user...')
    const profile = await authenticateUser(email, password)
    console.log('Authentication result:', { profile: !!profile })

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!profile.is_active) {
      return new Response(JSON.stringify({ error: 'Sua conta está inativa. Contate o suporte.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (profile.banned_at) {
      return new Response(JSON.stringify({ error: profile.ban_reason || 'Sua conta está suspensa.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Generating token...')
    const token = generateToken(profile)

    cookies.set('sb-access-token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    })

    console.log('Login successful')
    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Login error:', err.message)
    console.error('Login error stack:', err.stack)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
