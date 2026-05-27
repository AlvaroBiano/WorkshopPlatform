/* empty css                                      */
import { j as createComponent, n as renderHead, h as addAttribute, p as renderTemplate, i as createAstro } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
import { s as supabaseAdmin } from '../chunks/supabase-server_96w9zyaM.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const refCode = Astro2.url.searchParams.get("ref");
  if (refCode) {
    const { data: affiliate } = await supabaseAdmin.from("affiliates").select("id").eq("code", refCode.toUpperCase()).eq("status", "active").single();
    if (affiliate) {
      const visitorFp = "fp_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      await supabaseAdmin.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        visitor_fp: visitorFp,
        ip: Astro2.request.headers.get("x-forwarded-for")?.split(",")[0] || null,
        user_agent: Astro2.request.headers.get("user-agent") || null,
        referrer: Astro2.request.headers.get("referer") || null,
        landing_url: Astro2.url.pathname + Astro2.url.search
      });
    }
  }
  return renderTemplate`<html lang="pt-BR" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>WORKSHOP | Grupo Braga & Biano</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-[#0A0E1A] text-[#E8E8E8]" data-astro-cid-j7pv25f6> <section class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" data-astro-cid-j7pv25f6> <div class="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#0A0E1A] to-[#0F5132] opacity-50" data-astro-cid-j7pv25f6></div> <div class="relative z-10 max-w-4xl mx-auto text-center" data-astro-cid-j7pv25f6> <h1 class="font-['Playfair_Display'] text-5xl md:text-7xl text-[#D4AF37] mb-4 animate-fade-in" data-astro-cid-j7pv25f6>
WORKSHOP
</h1> <p class="text-xl md:text-2xl text-[#8E8E8E] mb-8 animate-slide-up" data-astro-cid-j7pv25f6>
Grupo Braga & Biano
</p> <p class="text-lg md:text-xl text-[#E8E8E8] max-w-2xl mx-auto mb-12 animate-slide-up" style="animation-delay: 0.1s" data-astro-cid-j7pv25f6>
Transforme sua vida com nosso workshop premium de alta transformação.
<span class="text-[#D4AF37] font-semibold" data-astro-cid-j7pv25f6>32 aulas</span> distribuídas em
<span class="text-[#D4AF37] font-semibold" data-astro-cid-j7pv25f6>6 módulos</span> completos.
</p> <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s" data-astro-cid-j7pv25f6> <a href="/login" class="btn btn-primary text-lg px-8 py-4" data-astro-cid-j7pv25f6>
Entrar na Área de Membros
</a> <a${addAttribute(refCode ? `/cadastro?ref=${refCode}` : "/cadastro", "href")} class="btn btn-secondary text-lg px-8 py-4" data-astro-cid-j7pv25f6>
Quero Participar
</a> </div> </div> <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0E1A] to-transparent" data-astro-cid-j7pv25f6></div> </section> <section class="py-20 px-4" data-astro-cid-j7pv25f6> <div class="max-w-6xl mx-auto" data-astro-cid-j7pv25f6> <h2 class="font-['Playfair_Display'] text-3xl md:text-4xl text-[#D4AF37] text-center mb-16" data-astro-cid-j7pv25f6>
O Que Você Vai Encontrar
</h2> <div class="grid md:grid-cols-3 gap-8" data-astro-cid-j7pv25f6> <div class="card p-6 text-center" data-astro-cid-j7pv25f6> <div class="text-4xl mb-4" data-astro-cid-j7pv25f6>🎓</div> <h3 class="text-xl text-[#D4AF37] mb-3" data-astro-cid-j7pv25f6>6 Módulos Completos</h3> <p class="text-[#8E8E8E]" data-astro-cid-j7pv25f6>
Conteúdo estruturado para você avançar passo a passo na sua jornada de transformação.
</p> </div> <div class="card p-6 text-center" data-astro-cid-j7pv25f6> <div class="text-4xl mb-4" data-astro-cid-j7pv25f6>📺</div> <h3 class="text-xl text-[#D4AF37] mb-3" data-astro-cid-j7pv25f6>Vídeos em Alta Qualidade</h3> <p class="text-[#8E8E8E]" data-astro-cid-j7pv25f6>
Player integrado com suporte a múltiplos dispositivos, legendas e muito mais.
</p> </div> <div class="card p-6 text-center" data-astro-cid-j7pv25f6> <div class="text-4xl mb-4" data-astro-cid-j7pv25f6>📊</div> <h3 class="text-xl text-[#D4AF37] mb-3" data-astro-cid-j7pv25f6>Acompanhe Seu Progresso</h3> <p class="text-[#8E8E8E]" data-astro-cid-j7pv25f6>
Sistema inteligente que salva sua posição e permite continuar de onde parou.
</p> </div> </div> </div> </section> <section class="py-20 px-4 bg-[#141B2D]" data-astro-cid-j7pv25f6> <div class="max-w-3xl mx-auto text-center" data-astro-cid-j7pv25f6> <h2 class="font-['Playfair_Display'] text-3xl md:text-4xl text-[#D4AF37] mb-6" data-astro-cid-j7pv25f6>
Pronto Para Começar?
</h2> <p class="text-lg text-[#8E8E8E] mb-8" data-astro-cid-j7pv25f6>
Acesso imediato após confirmação do pagamento. Sua jornada de transformação começa hoje.
</p> <a${addAttribute(refCode ? `/cadastro?ref=${refCode}` : "/cadastro", "href")} class="btn btn-primary text-lg px-8 py-4" data-astro-cid-j7pv25f6>
Garantir Minha Vaga
</a> </div> </section> <footer class="py-8 px-4 border-t border-white/5" data-astro-cid-j7pv25f6> <div class="max-w-6xl mx text-center text-[#8E8E8E] text-sm" data-astro-cid-j7pv25f6> <p data-astro-cid-j7pv25f6>© 2024 WORKSHOP | Grupo Braga & Biano. Todos os direitos reservados.</p> <div class="flex items-center justify-center gap-6 mt-4" data-astro-cid-j7pv25f6> <a href="/termos" class="hover:text-[#D4AF37] transition-colors" data-astro-cid-j7pv25f6>Termos de Uso</a> <a href="/privacidade" class="hover:text-[#D4AF37] transition-colors" data-astro-cid-j7pv25f6>Política de Privacidade</a> <a href="/suporte" class="hover:text-[#D4AF37] transition-colors" data-astro-cid-j7pv25f6>Suporte</a> </div> </div> </footer> </body></html>`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/index.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
