/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Settings = createComponent(async ($$result, $$props, $$slots) => {
  const { data: settings } = await supabaseAdmin.from("settings").select("*").eq("key", "platform").single();
  const platformSettings = settings?.value || {};
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Configura\xE7\xF5es" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-6">Configurações</h1> <form id="settingsForm" class="space-y-6"> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Configurações Gerais</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-text-muted mb-2">Nome da Plataforma</label> <input type="text" id="name" class="input"${addAttribute(platformSettings.name || "WORKSHOP", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Subtítulo</label> <input type="text" id="subtitle" class="input"${addAttribute(platformSettings.subtitle || "Grupo Braga & Biano", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Máximo de Dispositivos por Usuário</label> <input type="number" id="max_devices_per_user" class="input"${addAttribute(platformSettings.max_devices_per_user || 2, "value")} min="1" max="10"> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Dias do Cookie de Afiliado</label> <input type="number" id="affiliate_cookie_days" class="input"${addAttribute(platformSettings.affiliate_cookie_days || 30, "value")} min="1"> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Dias de Quarentena da Comissão</label> <input type="number" id="commission_quarantine_days" class="input"${addAttribute(platformSettings.commission_quarantine_days || 7, "value")} min="0"> </div> </div> </div> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Identidade Visual</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"> <div> <label class="block text-sm font-medium text-text-muted mb-2">Verde Principal</label> <input type="color" id="verde_principal" class="input h-12"${addAttribute(platformSettings.colors?.verde_principal || "#0F5132", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Verde Claro</label> <input type="color" id="verde_claro" class="input h-12"${addAttribute(platformSettings.colors?.verde_claro || "#198754", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Azul Profundo</label> <input type="color" id="azul_profundo" class="input h-12"${addAttribute(platformSettings.colors?.azul_profundo || "#0A2540", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Dourado</label> <input type="color" id="dourado" class="input h-12"${addAttribute(platformSettings.colors?.dourado || "#D4AF37", "value")}> </div> </div> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <div id="successMsg" class="hidden p-3 rounded-lg text-sm bg-verde-claro/10 border border-verde-claro/30 text-verde-claro"></div> <div class="flex justify-end"> <button type="submit" class="btn btn-primary">Salvar Configurações</button> </div> </form> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/settings.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/settings.astro";
const $$url = "/admin/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
