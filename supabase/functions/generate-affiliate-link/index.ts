import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateLinkRequest {
  affiliate_id: string
  visitor_fp?: string
  ip?: string
  user_agent?: string
  referrer?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { affiliate_id, visitor_fp, ip, user_agent, referrer }: GenerateLinkRequest = await req.json()

    if (!affiliate_id) {
      return new Response(
        JSON.stringify({ error: 'affiliate_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Buscar afiliado
    const { data: affiliate, error: affError } = await supabase
      .from('affiliates')
      .select('*, users!inner(*)')
      .eq('id', affiliate_id)
      .single()

    if (affError || !affiliate) {
      return new Response(
        JSON.stringify({ error: 'Afiliado não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (affiliate.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Afiliado não está ativo' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Registrar clique se fingerprint fornecido
    if (visitor_fp) {
      await supabase
        .from('affiliate_clicks')
        .insert({
          affiliate_id,
          visitor_fp,
          ip: ip || null,
          user_agent: user_agent || null,
          referrer: referrer || null,
          landing_url: `/?ref=${affiliate.code}`,
        })

      // Buscar settings para pegar cookie_days
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'platform')
        .single()

      const cookie_days = settings?.value?.affiliate_cookie_days || 30

      // Definir expiry do cookie
      const cookie_expiry = new Date(Date.now() + cookie_days * 24 * 60 * 60 * 1000).toUTCString()

      return new Response(
        JSON.stringify({
          success: true,
          link: `/?ref=${affiliate.code}`,
          code: affiliate.code,
          cookie_expiry,
          click_registered: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Apenas retorna o link sem registrar clique
    return new Response(
      JSON.stringify({
        success: true,
        link: `/?ref=${affiliate.code}`,
        code: affiliate.code,
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