/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = Astro2.locals.user;
  const [
    { count: totalStudents },
    { count: pendingCount },
    { data: recentOrders },
    { data: pendingStudents },
    { data: monthOrders }
  ] = await Promise.all([
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin.from("pending_registrations").select("*", { count: "exact", head: true }).eq("status", "awaiting_proof"),
    supabaseAdmin.from("orders").select("*, user:users(full_name), product:products(title)").order("created_at", { ascending: false }).limit(10),
    supabaseAdmin.from("pending_registrations").select("*").eq("status", "awaiting_proof").order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("orders").select("amount_cents").eq("status", "approved").gte("created_at", new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString())
  ]);
  const monthRevenue = (monthOrders || []).reduce((sum, o) => sum + (o.amount_cents || 0), 0);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold mb-6 text-dourado">
Olá, ${user?.full_name?.split(" ")[0]} </h1> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">🎓</span> <span class="text-xs uppercase tracking-wider text-text-muted">Alunos</span> </div> <p class="text-3xl font-display font-bold text-dourado">${totalStudents || 0}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">💰</span> <span class="text-xs uppercase tracking-wider text-text-muted">Receita Mês</span> </div> <p class="text-3xl font-display font-bold text-verde-claro">R$ ${(monthRevenue / 100).toFixed(0)}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">⏳</span> <span class="text-xs uppercase tracking-wider text-text-muted">Pendentes</span> </div> <p class="text-3xl font-display font-bold text-dourado">${pendingCount || 0}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">📦</span> <span class="text-xs uppercase tracking-wider text-text-muted">Produtos</span> </div> <p class="text-3xl font-display font-bold text-text-light">1</p> </div> </div> <section class="card p-6 mb-8"> <div class="flex justify-between items-center mb-4"> <h2 class="text-xl font-bold text-dourado">Aprovações Pendentes</h2> <a href="/admin/students" class="text-dourado text-sm hover:underline">Ver todas →</a> </div> ${(pendingStudents || []).length ? renderTemplate`<div class="space-y-3"> ${pendingStudents.map((s) => renderTemplate`<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg"> <div> <p class="font-semibold">${s.full_name}</p> <p class="text-sm text-text-muted">${s.email} · CPF: ${s.cpf}</p> </div> <div class="flex gap-2"> <button${addAttribute(`approveStudent('${s.id}')`, "onclick")} class="px-4 py-2 bg-verde-principal text-white rounded-lg text-sm hover:bg-verde-claro transition-colors">
Aprovar
</button> <button${addAttribute(`rejectStudent('${s.id}')`, "onclick")} class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
Rejeitar
</button> </div> </div>`)} </div>` : renderTemplate`<p class="text-text-muted text-center py-8">Nenhuma aprovação pendente</p>`} </section> <section class="card p-6"> <h2 class="text-xl font-bold text-dourado mb-4">Vendas Recentes</h2> <div class="overflow-x-auto"> <table class="w-full text-sm"> <thead class="text-text-muted border-b border-white/5"> <tr> <th class="text-left py-2">Aluno</th> <th class="text-left py-2">Produto</th> <th class="text-left py-2">Valor</th> <th class="text-left py-2">Status</th> <th class="text-left py-2">Data</th> </tr> </thead> <tbody> ${(recentOrders || []).map((o) => renderTemplate`<tr class="border-b border-white/5"> <td class="py-3">${o.user?.full_name || "\u2014"}</td> <td class="py-3">${o.product?.title || "\u2014"}</td> <td class="py-3 text-dourado font-semibold">R$ ${(o.amount_cents / 100).toFixed(2)}</td> <td class="py-3"> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    o.status === "approved" ? "bg-verde-claro/20 text-verde-claro" : o.status === "pending" ? "bg-dourado/20 text-dourado" : "bg-red-500/20 text-red-400"
  ], "class:list")}> ${o.status === "approved" ? "Aprovado" : o.status === "pending" ? "Pendente" : o.status} </span> </td> <td class="py-3 text-text-muted">${new Date(o.created_at).toLocaleDateString("pt-BR")}</td> </tr>`)} ${(!recentOrders || recentOrders.length === 0) && renderTemplate`<tr> <td colspan="5" class="py-8 text-center text-text-muted">Nenhuma venda registrada</td> </tr>`} </tbody> </table> </div> </section> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/index.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
