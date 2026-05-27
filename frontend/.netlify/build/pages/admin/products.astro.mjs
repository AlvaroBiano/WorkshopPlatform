/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: products } = await supabaseAdmin.from("products").select("*, modules(id, title, sort_order)").order("created_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Produtos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-display font-bold text-dourado">Produtos</h1> <a href="/admin/products/new" class="btn btn-primary">+ Novo Produto</a> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${(products || []).map((p) => renderTemplate`<div class="card overflow-hidden"> <div class="aspect-video bg-bg-card relative"> ${p.cover_url ? renderTemplate`<img${addAttribute(p.cover_url, "src")}${addAttribute(p.title, "alt")} class="w-full h-full object-cover">` : renderTemplate`<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-azul-profundo to-verde-principal"> <span class="text-4xl">📦</span> </div>`} <span class="absolute top-2 right-2 px-2 py-1 bg-bg-dark/80 backdrop-blur text-xs rounded uppercase text-text-light"> ${p.type} </span> </div> <div class="p-5"> <h3 class="font-bold text-lg mb-1">${p.title}</h3> <p class="text-sm text-text-muted mb-3 line-clamp-2">${p.description}</p> <div class="flex items-center justify-between mb-4"> <span class="text-2xl font-display font-bold text-dourado">
R$ ${(p.price_cents / 100).toFixed(2)} </span> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    p.status === "published" ? "bg-verde-claro/20 text-verde-claro" : p.status === "draft" ? "bg-dourado/20 text-dourado" : "bg-white/10 text-text-muted"
  ], "class:list")}> ${p.status} </span> </div> <div class="flex gap-2"> <a${addAttribute(`/admin/products/${p.id}`, "href")} class="flex-1 btn btn-secondary text-center text-sm">
Editar
</a> <span class="flex-1 btn btn-secondary text-center text-sm opacity-50 cursor-default"> ${p.modules?.length || 0} módulos
</span> </div> </div> </div>`)} ${(!products || products.length === 0) && renderTemplate`<div class="col-span-full text-center py-16 text-text-muted"> <p class="text-4xl mb-4">📦</p> <p>Nenhum produto cadastrado</p> </div>`} </div> ` })}`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/products/index.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/products/index.astro";
const $$url = "/admin/products";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
