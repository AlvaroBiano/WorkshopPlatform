/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AuthLayout } from '../chunks/AuthLayout_Fo_8duDp.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const error = Astro2.url.searchParams.get("error");
  const errorMessage = error === "banned" ? "Sua conta est\xE1 suspensa. Entre em contato com o suporte." : error === "inactive" ? "Sua conta est\xE1 inativa." : null;
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Entrar | WORKSHOP - Grupo Braga & Biano" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-azul-profundo via-bg-dark to-verde-principal opacity-40"></div> <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-dourado/5 rounded-full blur-3xl"></div> <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-verde-principal/10 rounded-full blur-3xl"></div> <div class="relative z-10 w-full max-w-md"> <div class="text-center mb-8"> <h1 class="font-display text-4xl md:text-5xl font-bold"> <span class="text-dourado">WORKSHOP</span> </h1> <p class="text-text-muted mt-2 tracking-widest text-sm uppercase">
Grupo Braga & Biano
</p> </div> <div class="card p-8"> <h2 class="text-2xl font-display text-dourado mb-1">Bem-vindo de volta</h2> <p class="text-text-muted mb-6">Acesse sua área de aluno</p> ${errorMessage && renderTemplate`<div class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"> ${errorMessage} </div>`} <form id="loginForm" class="space-y-5"> <div> <label for="email" class="block text-sm font-medium text-text-muted mb-2">E-mail</label> <input id="email" type="email" required autocomplete="email" class="input" placeholder="seu@email.com"> </div> <div> <label for="password" class="block text-sm font-medium text-text-muted mb-2">Senha</label> <input id="password" type="password" required autocomplete="current-password" class="input" placeholder="Sua senha"> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm"></div> <button type="submit" id="submitBtn" class="btn btn-primary w-full"> <span id="btnText">Entrar na plataforma</span> <span id="btnLoading" class="hidden"> <svg class="animate-spin h-5 w-5 inline" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path> </svg>
Verificando...
</span> </button> </form> <div class="mt-6 pt-6 border-t border-white/5 text-center"> <a href="/recuperar-senha" class="text-sm text-text-muted hover:text-dourado transition-colors">
Esqueci minha senha
</a> </div> </div> <p class="text-center text-text-muted text-xs mt-6">
Ainda não é aluno?
<a href="/cadastro" class="text-dourado hover:underline font-semibold">Conheça nossos workshops</a> </p> </div> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/login.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
