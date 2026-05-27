/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AuthLayout } from '../chunks/AuthLayout_Fo_8duDp.mjs';
import { s as supabaseAdmin } from '../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Cadastro = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Cadastro;
  const refCode = Astro2.url.searchParams.get("ref");
  const { data: products } = await supabaseAdmin.from("products").select("id, title, price_cents").eq("status", "published").order("created_at", { ascending: true });
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Cadastro | WORKSHOP - Grupo Braga & Biano" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-azul-profundo via-bg-dark to-verde-principal opacity-40"></div> <div class="relative z-10 w-full max-w-lg"> <div class="text-center mb-8"> <h1 class="font-display text-4xl font-bold text-dourado">WORKSHOP</h1> <p class="text-text-muted mt-2 tracking-widest text-sm uppercase">Grupo Braga & Biano</p> </div> <div class="card p-8"> <h2 class="text-2xl font-display text-dourado mb-1">Cadastre-se</h2> <p class="text-text-muted mb-6">Preencha seus dados para participar</p> <form id="registerForm" class="space-y-4"> <div> <label for="full_name" class="block text-sm font-medium text-text-muted mb-2">Nome completo</label> <input id="full_name" type="text" required class="input" placeholder="Seu nome completo"> </div> <div> <label for="email" class="block text-sm font-medium text-text-muted mb-2">E-mail</label> <input id="email" type="email" required class="input" placeholder="seu@email.com"> </div> <div> <label for="cpf" class="block text-sm font-medium text-text-muted mb-2">CPF</label> <input id="cpf" type="text" required class="input" placeholder="00000000000" maxlength="11" pattern="[0-9]{11}"> </div> <div> <label for="whatsapp" class="block text-sm font-medium text-text-muted mb-2">WhatsApp (DDI+DDD+Número)</label> <input id="whatsapp" type="tel" required class="input" placeholder="+5511999999999"> </div> <div> <label for="product" class="block text-sm font-medium text-text-muted mb-2">Workshop desejado</label> <select id="product" class="input" required> <option value="">Selecione...</option> ${products?.map((p) => renderTemplate`<option${addAttribute(p.id, "value")}> ${p.title} - R$ ${(p.price_cents / 100).toFixed(2)} </option>`)} </select> </div> ${refCode && renderTemplate`<div> <label class="block text-sm font-medium text-text-muted mb-2">Código de afiliado</label> <input type="text" class="input bg-white/5"${addAttribute(refCode, "value")} readonly> </div>`} <div> <label for="payment_proof" class="block text-sm font-medium text-text-muted mb-2">
Comprovante de pagamento (opcional)
</label> <input id="payment_proof" type="url" class="input" placeholder="Link do comprovante (Google Drive, etc)"> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <div id="successMsg" class="hidden p-3 rounded-lg text-sm bg-verde-claro/10 border border-verde-claro/30 text-verde-claro"></div> <button type="submit" id="submitBtn" class="btn btn-primary w-full"> <span id="btnText">Enviar Cadastro</span> <span id="btnLoading" class="hidden">Enviando...</span> </button> </form> <div class="mt-6 pt-6 border-t border-white/5 text-center"> <p class="text-text-muted text-sm">
Já tem conta?
<a href="/login" class="text-dourado hover:underline font-semibold">Entrar</a> </p> </div> </div> </div> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/cadastro.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/cadastro.astro";
const $$url = "/cadastro";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Cadastro,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
