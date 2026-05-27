import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  email: string
  password: string
  device_fingerprint: string
  device_name?: string
  os?: string
  browser?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password, device_fingerprint, device_name, os, browser }: LoginRequest = await req.json()

    if (!email || !password || !device_fingerprint) {
      return new Response(
        JSON.stringify({ error: 'email, password e device_fingerprint são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (user.banned_at) {
      return new Response(
        JSON.stringify({ error: 'Conta suspensa', code: 'BANNED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user.is_active) {
      return new Response(
        JSON.stringify({ error: 'Conta inativa', code: 'INACTIVE' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: devices } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_blocked', false)

    const existingDevice = devices?.find(d => d.device_fingerprint === device_fingerprint)

    let device_id: string
    let is_new_device = false
    let needs_approval = false

    if (existingDevice) {
      device_id = existingDevice.id
      await supabase
        .from('devices')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', device_id)
    } else {
      is_new_device = true

      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'platform')
        .single()

      const max_devices = settings?.value?.max_devices_per_user || 2
      const approvedDevices = devices?.filter(d => d.is_approved) || []

      if (approvedDevices.length >= max_devices) {
        await supabase.from('devices').insert({
          user_id: user.id,
          device_fingerprint,
          device_name: device_name || 'Desconhecido',
          os: os || 'Desconhecido',
          browser: browser || 'Desconhecido',
          is_approved: false,
          registered_at: new Date().toISOString(),
        })

        return new Response(
          JSON.stringify({
            error: 'Limite de dispositivos atingido',
            code: 'DEVICE_LIMIT_EXCEEDED',
            max_devices,
            current_devices: approvedDevices.length,
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const isFirstDevice = approvedDevices.length === 0
      const autoApprove = isFirstDevice

      const { data: newDevice, error: deviceError } = await supabase
        .from('devices')
        .insert({
          user_id: user.id,
          device_fingerprint,
          device_name: device_name || 'Desconhecido',
          os: os || 'Desconhecido',
          browser: browser || 'Desconhecido',
          is_approved: autoApprove,
          registered_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (deviceError) {
        console.error('Erro ao criar dispositivo:', deviceError)
        return new Response(
          JSON.stringify({ error: 'Erro ao registrar dispositivo' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      device_id = newDevice.id
      needs_approval = !autoApprove

      if (!autoApprove) {
        const { data: admins } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'super_admin'])

        for (const admin of admins || []) {
          await supabase.from('notifications').insert({
            user_id: admin.id,
            title: 'Novo Dispositivo',
            body: `Novo dispositivo registrado para ${user.full_name}. Aprovar no painel.`,
            type: 'system',
            link_url: '/admin/devices',
          })
        }
      }
    }

    if (needs_approval) {
      return new Response(
        JSON.stringify({
          error: 'Novo dispositivo aguardando aprovação',
          code: 'DEVICE_PENDING_APPROVAL',
          device: { id: device_id, needs_approval: true },
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'LOGIN_SUCCESS',
      entity_type: 'users',
      entity_id: user.id,
      details: { device_id, is_new_device },
    })

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          first_login: user.first_login,
          must_change_password: user.must_change_password,
        },
        device: {
          id: device_id,
          is_new: is_new_device,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
