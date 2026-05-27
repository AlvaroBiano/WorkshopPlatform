/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AuthLayout } from '../chunks/AuthLayout_Fo_8duDp.mjs';
export { renderers } from '../renderers.mjs';

const $$FirstAccess = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Primeiro Acesso | WORKSHOP" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-azul-profundo via-bg-dark to-verde-principal opacity-40"></div> <div class="relative z-10 w-full max-w-md"> <div class="text-center mb-8"> <h1 class="font-display text-4xl font-bold text-dourado">WORKSHOP</h1> <p class="text-text-muted mt-2 tracking-widest text-sm uppercase">Grupo Braga & Biano</p> </div> <div class="card p-8"> <div class="text-center mb-6"> <span class="text-4xl">👋</span> <h2 class="text-2xl font-display text-dourado mt-3">Bem-vindo(a)!</h2> <p class="text-text-muted mt-2">
Para sua segurança, crie uma nova senha diferente do seu CPF.
</p> </div> <form id="firstAccessForm" class="space-y-5"> <div> <label for="new_password" class="block text-sm font-medium text-text-muted mb-2">Nova senha</label> <input id="new_password" type="password" required minlength="8" class="input" placeholder="Mínimo 8 caracteres"> <p class="text-xs text-text-muted mt-1">Use letras, números e caracteres especiais</p> </div> <div> <label for="confirm_password" class="block text-sm font-medium text-text-muted mb-2">Confirmar nova senha</label> <input id="confirm_password" type="password" required minlength="8" class="input" placeholder="Repita a senha"> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <button type="submit" id="submitBtn" class="btn btn-primary w-full"> <span id="btnText">Criar Senha e Continuar</span> <span id="btnLoading" class="hidden">Atualizando...</span> </button> </form> </div> </div> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/first-access.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/first-access.astro";
const $$url = "/first-access";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$FirstAccess,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
