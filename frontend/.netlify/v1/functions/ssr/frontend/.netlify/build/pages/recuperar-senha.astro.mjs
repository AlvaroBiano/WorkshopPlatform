/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AuthLayout } from '../chunks/AuthLayout_Fo_8duDp.mjs';
export { renderers } from '../renderers.mjs';

const $$RecuperarSenha = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Recuperar Senha | WORKSHOP" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-azul-profundo via-bg-dark to-verde-principal opacity-40"></div> <div class="relative z-10 w-full max-w-md"> <div class="text-center mb-8"> <h1 class="font-display text-4xl font-bold text-dourado">WORKSHOP</h1> <p class="text-text-muted mt-2 tracking-widest text-sm uppercase">Grupo Braga & Biano</p> </div> <div class="card p-8"> <h2 class="text-2xl font-display text-dourado mb-1">Recuperar Senha</h2> <p class="text-text-muted mb-6">
Informe seu e-mail e nossa equipe irá resetar sua senha para o CPF.
</p> <form id="recoverForm" class="space-y-5"> <div> <label for="email" class="block text-sm font-medium text-text-muted mb-2">E-mail cadastrado</label> <input id="email" type="email" required class="input" placeholder="seu@email.com"> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <div id="successMsg" class="hidden p-3 rounded-lg text-sm bg-verde-claro/10 border border-verde-claro/30 text-verde-claro"></div> <button type="submit" id="submitBtn" class="btn btn-primary w-full"> <span id="btnText">Solicitar Recuperação</span> <span id="btnLoading" class="hidden">Enviando...</span> </button> </form> <div class="mt-6 pt-6 border-t border-white/5 text-center"> <a href="/login" class="text-sm text-dourado hover:underline">Voltar ao login</a> </div> </div> </div> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/recuperar-senha.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/recuperar-senha.astro";
const $$url = "/recuperar-senha";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RecuperarSenha,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
