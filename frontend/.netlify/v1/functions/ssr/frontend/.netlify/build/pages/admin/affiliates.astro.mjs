/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Affiliates = createComponent(async ($$result, $$props, $$slots) => {
  const { data: affiliates } = await supabaseAdmin.from("affiliates").select("*, user:users(full_name, email)").order("created_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Afiliados" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-6">Gestão de Afiliados</h1> <div class="card overflow-hidden"> <table class="w-full text-sm"> <thead class="bg-white/5 text-text-muted"> <tr> <th class="text-left p-4">Afiliado</th> <th class="text-left p-4">Código</th> <th class="text-left p-4">Comissão</th> <th class="text-left p-4">Saldo</th> <th class="text-left p-4">Status</th> <th class="text-left p-4">Ações</th> </tr> </thead> <tbody> ${(affiliates || []).map((a) => renderTemplate`<tr class="border-t border-white/5"> <td class="p-4"> <p class="font-semibold">${a.user?.full_name}</p> <p class="text-xs text-text-muted">${a.user?.email}</p> </td> <td class="p-4 font-mono text-dourado">${a.code}</td> <td class="p-4">${a.commission_pct}%</td> <td class="p-4 text-verde-claro">R$ ${((a.balance_cents || 0) / 100).toFixed(2)}</td> <td class="p-4"> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    a.status === "active" ? "bg-verde-claro/20 text-verde-claro" : a.status === "pending" ? "bg-dourado/20 text-dourado" : "bg-red-500/20 text-red-400"
  ], "class:list")}> ${a.status === "active" ? "Ativo" : a.status === "pending" ? "Pendente" : "Bloqueado"} </span> </td> <td class="p-4"> ${a.status === "pending" && renderTemplate`<button${addAttribute(`approveAffiliate('${a.id}')`, "onclick")} class="text-xs px-2 py-1 bg-verde-claro/20 text-verde-claro rounded">
Aprovar
</button>`} </td> </tr>`)} ${(!affiliates || affiliates.length === 0) && renderTemplate`<tr> <td colspan="6" class="p-8 text-center text-text-muted">Nenhum afiliado cadastrado</td> </tr>`} </tbody> </table> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/affiliates.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/affiliates.astro";
const $$url = "/admin/affiliates";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Affiliates,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
