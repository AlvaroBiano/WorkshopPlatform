/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Devices = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Devices;
  const userId = Astro2.url.searchParams.get("user");
  const query = supabaseAdmin.from("devices").select("*, user:users(full_name, email)").order("registered_at", { ascending: false });
  const { data: devices } = userId ? await query.eq("user_id", userId) : await query;
  const { data: filterUser } = userId ? await supabaseAdmin.from("users").select("*").eq("id", userId).single() : { data: null };
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dispositivos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-6">Gestão de Dispositivos</h1> ${filterUser && renderTemplate`<div class="card p-4 mb-6 bg-dourado/10 border-dourado/30"> <p class="text-sm text-text-muted">Visualizando dispositivos de:</p> <p class="font-bold text-lg">${filterUser.full_name} · ${filterUser.email}</p> </div>`}<div class="card overflow-hidden"> <table class="w-full text-sm"> <thead class="bg-white/5 text-text-muted"> <tr> <th class="text-left p-4">Aluno</th> <th class="text-left p-4">Dispositivo</th> <th class="text-left p-4">IP</th> <th class="text-left p-4">Status</th> <th class="text-left p-4">Último acesso</th> <th class="text-left p-4">Ações</th> </tr> </thead> <tbody> ${(devices || []).map((d) => renderTemplate`<tr class="border-t border-white/5"> <td class="p-4"> <p class="font-semibold">${d.user?.full_name}</p> <p class="text-xs text-text-muted">${d.user?.email}</p> </td> <td class="p-4"> <p>${d.device_name}</p> <p class="text-xs text-text-muted">${d.os} · ${d.browser}</p> </td> <td class="p-4 font-mono text-xs">${d.ip_last_login || "\u2014"}</td> <td class="p-4"> ${d.is_blocked ? renderTemplate`<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Bloqueado</span>` : d.is_approved ? renderTemplate`<span class="px-2 py-1 bg-verde-claro/20 text-verde-claro rounded text-xs">Aprovado</span>` : renderTemplate`<span class="px-2 py-1 bg-dourado/20 text-dourado rounded text-xs">Pendente</span>`} </td> <td class="p-4 text-text-muted text-xs"> ${new Date(d.last_seen_at).toLocaleString("pt-BR")} </td> <td class="p-4"> <div class="flex gap-2"> ${!d.is_approved && !d.is_blocked && renderTemplate`<button${addAttribute(`approveDevice('${d.id}')`, "onclick")} class="text-xs px-2 py-1 bg-verde-claro/20 text-verde-claro rounded">
Aprovar
</button>`} ${d.is_approved && !d.is_blocked && renderTemplate`<button${addAttribute(`blockDevice('${d.id}')`, "onclick")} class="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
Bloquear
</button>`} </div> </td> </tr>`)} ${(!devices || devices.length === 0) && renderTemplate`<tr> <td colspan="6" class="p-8 text-center text-text-muted">Nenhum dispositivo encontrado</td> </tr>`} </tbody> </table> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/devices.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/devices.astro";
const $$url = "/admin/devices";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Devices,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
