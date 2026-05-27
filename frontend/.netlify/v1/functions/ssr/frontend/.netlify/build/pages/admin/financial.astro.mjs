/* empty css                                         */
import { j as createComponent, p as renderTemplate, l as defineScriptVars, r as renderComponent, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Financial = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Financial;
  const statusFilter = Astro2.url.searchParams.get("status") || "all";
  const dateFrom = Astro2.url.searchParams.get("from");
  const dateTo = Astro2.url.searchParams.get("to");
  let query = supabaseAdmin.from("orders").select("*, user:users(full_name, email), product:products(title), affiliate:users!orders_affiliate_id_fkey(full_name)").order("created_at", { ascending: false });
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }
  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }
  const { data: orders } = await query;
  const { count: totalOrders } = await supabaseAdmin.from("orders").select("*", { count: "exact", head: true });
  const { data: approvedOrders } = await supabaseAdmin.from("orders").select("amount_cents").eq("status", "approved");
  const totalRevenue = (approvedOrders || []).reduce((sum, o) => sum + (o.amount_cents || 0), 0);
  const { data: monthOrders } = await supabaseAdmin.from("orders").select("amount_cents").eq("status", "approved").gte("created_at", new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString());
  const monthRevenue = (monthOrders || []).reduce((sum, o) => sum + (o.amount_cents || 0), 0);
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  window.exportCSV = () => {\n    if (!orders || orders.length === 0) {\n      alert('Nenhum dado para exportar')\n      return\n    }\n\n    const headers = ['Pedido', 'Cliente', 'Email', 'Produto', 'Valor', 'Afiliado', 'Status', 'Data']\n    const rows = orders.map((o: any) => [\n      o.order_number,\n      o.user?.full_name || '',\n      o.user?.email || '',\n      o.product?.title || '',\n      (o.amount_cents / 100).toFixed(2),\n      o.affiliate?.full_name || '',\n      o.status,\n      new Date(o.created_at).toLocaleDateString('pt-BR'),\n    ])\n\n    const csv = [headers, ...rows].map(row => row.map(cell => `\"${cell}\"`).join(',')).join('\\n')\n    const blob = new Blob([csv], { type: 'text/csv' })\n    const url = URL.createObjectURL(blob)\n    const a = document.createElement('a')\n    a.href = url\n    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`\n    a.click()\n    URL.revokeObjectURL(url)\n  }\n})();<\/script>"], ["", " <script>(function(){", "\n  window.exportCSV = () => {\n    if (!orders || orders.length === 0) {\n      alert('Nenhum dado para exportar')\n      return\n    }\n\n    const headers = ['Pedido', 'Cliente', 'Email', 'Produto', 'Valor', 'Afiliado', 'Status', 'Data']\n    const rows = orders.map((o: any) => [\n      o.order_number,\n      o.user?.full_name || '',\n      o.user?.email || '',\n      o.product?.title || '',\n      (o.amount_cents / 100).toFixed(2),\n      o.affiliate?.full_name || '',\n      o.status,\n      new Date(o.created_at).toLocaleDateString('pt-BR'),\n    ])\n\n    const csv = [headers, ...rows].map(row => row.map(cell => \\`\"\\${cell}\"\\`).join(',')).join('\\\\n')\n    const blob = new Blob([csv], { type: 'text/csv' })\n    const url = URL.createObjectURL(blob)\n    const a = document.createElement('a')\n    a.href = url\n    a.download = \\`pedidos-\\${new Date().toISOString().split('T')[0]}.csv\\`\n    a.click()\n    URL.revokeObjectURL(url)\n  }\n})();<\/script>"])), renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Financeiro" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-6">Financeiro</h1> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">📦</span> <span class="text-xs uppercase tracking-wider text-text-muted">Total Pedidos</span> </div> <p class="text-3xl font-display font-bold text-dourado">${totalOrders || 0}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">💰</span> <span class="text-xs uppercase tracking-wider text-text-muted">Receita Total</span> </div> <p class="text-3xl font-display font-bold text-verde-claro">R$ ${(totalRevenue / 100).toFixed(0)}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">📅</span> <span class="text-xs uppercase tracking-wider text-text-muted">Receita Mês</span> </div> <p class="text-3xl font-display font-bold text-verde-claro">R$ ${(monthRevenue / 100).toFixed(0)}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">✅</span> <span class="text-xs uppercase tracking-wider text-text-muted">Aprovados</span> </div> <p class="text-3xl font-display font-bold text-dourado">${approvedOrders?.length || 0}</p> </div> </div> <div class="card p-6 mb-6"> <h2 class="font-bold text-dourado mb-4">Filtros</h2> <form method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-4"> <div> <label class="block text-sm font-medium text-text-muted mb-2">Status</label> <select name="status" class="input"> <option value="all"${addAttribute(statusFilter === "all", "selected")}>Todos</option> <option value="pending"${addAttribute(statusFilter === "pending", "selected")}>Pendente</option> <option value="approved"${addAttribute(statusFilter === "approved", "selected")}>Aprovado</option> <option value="refunded"${addAttribute(statusFilter === "refunded", "selected")}>Reembolsado</option> <option value="cancelled"${addAttribute(statusFilter === "cancelled", "selected")}>Cancelado</option> </select> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">De</label> <input type="date" name="from" class="input"${addAttribute(dateFrom || "", "value")}> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Até</label> <input type="date" name="to" class="input"${addAttribute(dateTo || "", "value")}> </div> <div class="flex items-end"> <button type="submit" class="btn btn-primary w-full">Filtrar</button> </div> </form> </div> <div class="card overflow-hidden"> <div class="p-4 border-b border-white/5 flex justify-between items-center"> <h2 class="font-bold text-dourado">Pedidos (${orders?.length || 0})</h2> <button onclick="exportCSV()" class="btn btn-secondary text-sm">Exportar CSV</button> </div> <table class="w-full text-sm"> <thead class="bg-white/5 text-text-muted"> <tr> <th class="text-left p-4">Pedido</th> <th class="text-left p-4">Cliente</th> <th class="text-left p-4">Produto</th> <th class="text-left p-4">Valor</th> <th class="text-left p-4">Afiliado</th> <th class="text-left p-4">Status</th> <th class="text-left p-4">Data</th> </tr> </thead> <tbody> ${(orders || []).map((o) => renderTemplate`<tr class="border-t border-white/5"> <td class="p-4 font-mono text-xs">${o.order_number}</td> <td class="p-4"> <p class="font-semibold">${o.user?.full_name || "\u2014"}</p> <p class="text-xs text-text-muted">${o.user?.email}</p> </td> <td class="p-4">${o.product?.title || "\u2014"}</td> <td class="p-4 text-dourado font-semibold">R$ ${(o.amount_cents / 100).toFixed(2)}</td> <td class="p-4 text-xs">${o.affiliate?.full_name || "\u2014"}</td> <td class="p-4"> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    o.status === "approved" ? "bg-verde-claro/20 text-verde-claro" : o.status === "pending" ? "bg-dourado/20 text-dourado" : o.status === "refunded" ? "bg-azul-accent/20 text-azul-accent" : "bg-red-500/20 text-red-400"
  ], "class:list")}> ${o.status === "approved" ? "Aprovado" : o.status === "pending" ? "Pendente" : o.status === "refunded" ? "Reembolsado" : "Cancelado"} </span> </td> <td class="p-4 text-text-muted text-xs">${new Date(o.created_at).toLocaleDateString("pt-BR")}</td> </tr>`)} ${(!orders || orders.length === 0) && renderTemplate`<tr> <td colspan="7" class="p-8 text-center text-text-muted">Nenhum pedido encontrado</td> </tr>`} </tbody> </table> </div> ` }), defineScriptVars({ orders }));
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/financial.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/financial.astro";
const $$url = "/admin/financial";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Financial,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
