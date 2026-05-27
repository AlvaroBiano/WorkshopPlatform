/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Messages = createComponent(async ($$result, $$props, $$slots) => {
  const { data: recentNotifications } = await supabaseAdmin.from("notifications").select("*, user:users(full_name, email)").order("created_at", { ascending: false }).limit(50);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Mensagens" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 class="text-2xl font-display font-bold text-dourado mb-6">Mensagens</h1> <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Enviar Notificação</h2> <form id="notifForm" class="space-y-4"> <div> <label class="block text-sm font-medium text-text-muted mb-2">Destinatário</label> <select id="recipient" class="input"> <option value="all">Todos os alunos</option> <option value="specific">Aluno específico</option> </select> </div> <div id="specificUser" class="hidden"> <label class="block text-sm font-medium text-text-muted mb-2">E-mail do aluno</label> <input type="email" id="user_email" class="input" placeholder="aluno@email.com"> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Título</label> <input type="text" id="title" class="input" required> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Mensagem</label> <textarea id="body" class="input" rows="4" required></textarea> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Link (opcional)</label> <input type="url" id="link_url" class="input" placeholder="/student"> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <div id="successMsg" class="hidden p-3 rounded-lg text-sm bg-verde-claro/10 border border-verde-claro/30 text-verde-claro"></div> <button type="submit" class="btn btn-primary w-full">Enviar Notificação</button> </form> </div> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Estatísticas</h2> <div class="space-y-3"> <div class="flex justify-between"> <span class="text-text-muted">Total de notificações enviadas</span> <span class="font-semibold text-dourado">${recentNotifications?.length || 0}</span> </div> <div class="flex justify-between"> <span class="text-text-muted">Última notificação</span> <span class="font-semibold text-dourado"> ${recentNotifications?.[0] ? new Date(recentNotifications[0].created_at).toLocaleDateString("pt-BR") : "\u2014"} </span> </div> </div> </div> </div> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Notificações Recentes</h2> <div class="space-y-3"> ${(recentNotifications || []).map((n) => renderTemplate`<div class="p-4 bg-white/5 rounded-lg"> <div class="flex justify-between items-start mb-2"> <div> <p class="font-semibold">${n.title}</p> <p class="text-xs text-text-muted">${n.user?.full_name} · ${n.user?.email}</p> </div> <span class="text-xs text-text-muted">${new Date(n.created_at).toLocaleString("pt-BR")}</span> </div> <p class="text-sm text-text-muted">${n.body}</p> </div>`)} ${(!recentNotifications || recentNotifications.length === 0) && renderTemplate`<p class="text-text-muted text-center py-8">Nenhuma notificação enviada</p>`} </div> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/messages.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/messages.astro";
const $$url = "/admin/messages";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Messages,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
