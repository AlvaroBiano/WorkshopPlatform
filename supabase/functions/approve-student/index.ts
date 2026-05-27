import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveStudentRequest {
  user_id: string
  product_id: string
  approved_by: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { user_id, product_id, approved_by }: ApproveStudentRequest = await req.json()

    if (!user_id || !product_id) {
      return new Response(
        JSON.stringify({ error: 'user_id e product_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Criar acesso ao produto (ou atualizar se já existir)
    const { error: accessError } = await supabase
      .from('product_access')
      .upsert({
        user_id,
        product_id,
        granted_by: approved_by,
        granted_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,product_id'
      })

    if (accessError) {
      console.error('Erro ao criar access:', accessError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar acesso ao produto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Criar notificação de boas-vindas
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title: '🎉 Acesso Liberado!',
        body: `Seu acesso ao workshop foi liberado! Clique aqui para começar.`,
        type: 'access_granted',
        link_url: '/dashboard',
      })

    if (notifError) {
      console.error('Erro ao criar notificação:', notifError)
      // Não falha o processo por causa da notificação
    }

    // 4. Registrar na auditoria
    await supabase
      .from('audit_log')
      .insert({
        user_id: approved_by,
        action: 'APPROVE_STUDENT',
        entity_type: 'users',
        entity_id: user_id,
        details: { product_id, user_email: user.email },
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Aluno aprovado com sucesso',
        data: {
          user_id,
          product_id,
          access_granted: true,
        }
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