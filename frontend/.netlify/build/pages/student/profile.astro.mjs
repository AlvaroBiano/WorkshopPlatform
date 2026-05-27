/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$StudentLayout } from '../../chunks/StudentLayout_DWtYTFem.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Profile;
  const user = Astro2.locals.user;
  if (!user) return Astro2.redirect("/login");
  const { data: devices } = await supabaseAdmin.from("devices").select("*").eq("user_id", user.id).order("registered_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "StudentLayout", $$StudentLayout, { "title": "Meu Perfil | WORKSHOP" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-8">Meu Perfil</h1> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Dados Pessoais</h2> <div class="space-y-3"> <div> <p class="text-xs text-text-muted">Nome</p> <p class="font-semibold">${user.full_name}</p> </div> <div> <p class="text-xs text-text-muted">E-mail</p> <p class="font-semibold">${user.email}</p> </div> <div> <p class="text-xs text-text-muted">WhatsApp</p> <p class="font-semibold">${user.whatsapp || "\u2014"}</p> </div> </div> </div> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Meus Dispositivos</h2> <p class="text-sm text-text-muted mb-4">
Máximo de 2 dispositivos autorizados.
</p> <div class="space-y-3"> ${(devices || []).map((d) => renderTemplate`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg"> <div> <p class="font-semibold text-sm">${d.device_name}</p> <p class="text-xs text-text-muted">${d.os} · ${d.browser}</p> </div> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    d.is_approved ? "bg-verde-claro/20 text-verde-claro" : "bg-dourado/20 text-dourado"
  ], "class:list")}> ${d.is_approved ? "Ativo" : "Pendente"} </span> </div>`)} ${(!devices || devices.length === 0) && renderTemplate`<p class="text-text-muted text-sm">Nenhum dispositivo registrado</p>`} </div> </div> </div> ` })}`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/profile.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/profile.astro";
const $$url = "/student/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
