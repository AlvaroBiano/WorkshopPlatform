/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$StudentLayout } from '../../chunks/StudentLayout_DWtYTFem.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const user = Astro2.locals.user;
  if (!user) return Astro2.redirect("/login");
  const { data: affiliate } = await supabaseAdmin.from("affiliates").select("*").eq("user_id", user.id).single();
  if (!affiliate) return Astro2.redirect("/student");
  const siteUrl = "http://localhost:4321";
  const referralLink = `${siteUrl}/?ref=${affiliate.code}`;
  const { count: totalClicks } = await supabaseAdmin.from("affiliate_clicks").select("*", { count: "exact", head: true }).eq("affiliate_id", affiliate.id);
  const { count: conversions } = await supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("affiliate_id", user.id).eq("status", "approved");
  const { data: recentClicks } = await supabaseAdmin.from("affiliate_clicks").select("*").eq("affiliate_id", affiliate.id).order("clicked_at", { ascending: false }).limit(20);
  const { data: withdrawals } = await supabaseAdmin.from("affiliate_withdrawals").select("*").eq("affiliate_id", affiliate.id).order("requested_at", { ascending: false });
  const conversionRate = totalClicks ? ((conversions || 0) / totalClicks * 100).toFixed(2) : "0";
  return renderTemplate`${renderComponent($$result, "StudentLayout", $$StudentLayout, { "title": "Painel do Afiliado | WORKSHOP" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-2">Painel do Afiliado</h1> <p class="text-text-muted mb-8">Bem-vindo, ${user.full_name}!</p> <div class="card p-6 mb-8 bg-gradient-to-br from-dourado/10 to-transparent border-dourado/30"> <h2 class="font-bold mb-3 text-dourado">Seu Link de Afiliado</h2> <div class="flex gap-2"> <input type="text" readonly${addAttribute(referralLink, "value")} id="refLink" class="input flex-1 font-mono text-sm"> <button onclick="copyLink()" class="btn btn-primary">Copiar</button> </div> <p class="text-xs text-text-muted mt-2">
Código: <strong class="text-dourado">${affiliate.code}</strong> · Comissão: <strong class="text-dourado">${affiliate.commission_pct}%</strong> </p> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">👆</span> <span class="text-xs uppercase tracking-wider text-text-muted">Cliques</span> </div> <p class="text-3xl font-display font-bold text-azul-accent">${totalClicks || 0}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">🎯</span> <span class="text-xs uppercase tracking-wider text-text-muted">Conversões</span> </div> <p class="text-3xl font-display font-bold text-verde-claro">${conversions || 0}</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">📊</span> <span class="text-xs uppercase tracking-wider text-text-muted">Taxa Conv.</span> </div> <p class="text-3xl font-display font-bold text-dourado">${conversionRate}%</p> </div> <div class="card p-5"> <div class="flex items-center justify-between mb-2"> <span class="text-2xl">💰</span> <span class="text-xs uppercase tracking-wider text-text-muted">Saldo Disp.</span> </div> <p class="text-3xl font-display font-bold text-dourado">R$ ${((affiliate.balance_cents || 0) / 100).toFixed(0)}</p> </div> </div> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> <div class="card p-6"> <h2 class="font-bold mb-4 text-dourado">Meus Ganhos</h2> <div class="space-y-3"> <div class="flex justify-between"> <span class="text-text-muted">Pendente (quarentena)</span> <span class="text-dourado font-semibold">R$ ${((affiliate.balance_pending_cents || 0) / 100).toFixed(2)}</span> </div> <div class="flex justify-between"> <span class="text-text-muted">Disponível para saque</span> <span class="text-verde-claro font-semibold">R$ ${((affiliate.balance_cents || 0) / 100).toFixed(2)}</span> </div> <div class="flex justify-between pt-3 border-t border-white/5"> <span class="text-text-muted">Total ganho</span> <span class="text-dourado font-bold text-lg">R$ ${(((affiliate.balance_cents || 0) + (affiliate.balance_pending_cents || 0)) / 100).toFixed(2)}</span> </div> </div> ${(affiliate.balance_cents || 0) >= 1e4 && renderTemplate`<button onclick="requestWithdraw()" class="btn btn-primary w-full mt-4">
Solicitar Saque
</button>`} </div> <div class="card p-6"> <h2 class="font-bold mb-4 text-dourado">Dados de Pagamento</h2> <div class="space-y-3 text-sm"> <div> <p class="text-text-muted">Chave PIX cadastrada:</p> <p class="font-mono">${affiliate.pix_key || "—"}</p> </div> </div> </div> </div> <div class="card p-6 mb-8"> <h2 class="font-bold mb-4 text-dourado">Cliques Recentes</h2> <div class="overflow-x-auto"> <table class="w-full text-sm"> <thead class="text-text-muted border-b border-white/5"> <tr> <th class="text-left py-2">Data</th> <th class="text-left py-2">IP</th> <th class="text-left py-2">Origem</th> </tr> </thead> <tbody> ${(recentClicks || []).map((c) => renderTemplate`<tr class="border-b border-white/5"> <td class="py-2 text-text-muted">${new Date(c.clicked_at).toLocaleString("pt-BR")}</td> <td class="py-2 font-mono text-xs">${c.ip || "—"}</td> <td class="py-2 text-xs">${c.referrer?.slice(0, 40) || "—"}</td> </tr>`)} ${(!recentClicks || recentClicks.length === 0) && renderTemplate`<tr> <td colspan="3" class="py-8 text-center text-text-muted">Nenhum clique registrado</td> </tr>`} </tbody> </table> </div> </div> ${(withdrawals || []).length > 0 && renderTemplate`<div class="card p-6"> <h2 class="font-bold mb-4 text-dourado">Histórico de Saques</h2> <div class="space-y-2"> ${withdrawals.map((w) => renderTemplate`<div class="flex justify-between items-center p-3 bg-white/5 rounded"> <div> <p class="font-semibold">R$ ${(w.amount_cents / 100).toFixed(2)}</p> <p class="text-xs text-text-muted">${new Date(w.requested_at).toLocaleDateString("pt-BR")}</p> </div> <span${addAttribute([
    "px-2 py-1 rounded text-xs",
    w.status === "paid" ? "bg-verde-claro/20 text-verde-claro" : w.status === "approved" ? "bg-azul-accent/20 text-azul-accent" : w.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-dourado/20 text-dourado"
  ], "class:list")}> ${w.status === "paid" ? "Pago" : w.status === "approved" ? "Aprovado" : w.status === "rejected" ? "Rejeitado" : "Em análise"} </span> </div>`)} </div> </div>`}` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/affiliate/dashboard.astro", void 0);
const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/affiliate/dashboard.astro";
const $$url = "/affiliate/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
