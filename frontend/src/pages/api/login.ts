import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../lib/supabase-server'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000),
    })

    if (!authRes.ok) {
      const err = await authRes.json().catch(() => ({}))
      return new Response(JSON.stringify({
        error: err.error_description || err.msg || err.error || 'Credenciais inválidas',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const authData = await authRes.json()
    const accessToken = authData.access_token
    const refreshToken = authData.refresh_token

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Erro ao validar sessão' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Perfil não encontrado. Contate o suporte.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!profile.is_active) {
      return new Response(JSON.stringify({ error: 'Sua conta está inativa. Contate o suporte.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    cookies.set('sb-access-token', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    })

    if (refreshToken) {
      cookies.set('sb-refresh-token', refreshToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', profile.id)

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const msg = err?.name === 'TimeoutError'
      ? 'Servidor Supabase não respondeu (timeout)'
      : err?.message?.includes('fetch')
      ? 'Erro de conexão com o Supabase'
      : 'Erro interno do servidor'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
