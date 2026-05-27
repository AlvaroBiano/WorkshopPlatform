import { j as createComponent, n as renderHead, p as renderTemplate, o as renderSlot, i as createAstro } from './astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                              */
import { s as supabaseAdmin } from './supabase-server_96w9zyaM.mjs';

const $$Astro = createAstro();
const $$StudentLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StudentLayout;
  const { title = "\xC1rea do Aluno | WORKSHOP" } = Astro2.props;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/login");
  }
  const { data: notifications } = await supabaseAdmin.from("notifications").select("*").eq("user_id", user.id).is("read_at", null).order("created_at", { ascending: false }).limit(10);
  const unreadCount = notifications?.length || 0;
  return renderTemplate`<html lang="pt-BR"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-bg-dark text-text-light min-h-screen"> <header class="sticky top-0 z-50 bg-bg-dark/95 backdrop-blur-sm border-b border-white/5"> <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"> <a href="/student" class="flex items-center gap-2"> <span class="font-display text-2xl font-bold text-dourado">WORKSHOP</span> <span class="hidden md:inline text-xs text-text-muted tracking-widest">| Área do Aluno</span> </a> <div class="flex items-center gap-4"> <div class="relative" id="notifContainer"> <button id="notifBtn" class="relative p-2 hover:bg-white/5 rounded-lg transition-colors"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path> </svg> ${unreadCount > 0 && renderTemplate`<span class="absolute -top-1 -right-1 bg-dourado text-azul-profundo text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"> ${unreadCount} </span>`} </button> <div id="notifPanel" class="hidden absolute right-0 top-12 w-80 bg-bg-card border border-white/10 rounded-xl shadow-xl p-4 max-h-96 overflow-y-auto"> <h3 class="font-bold mb-3 text-dourado">Notificações</h3> ${notifications?.length ? notifications.map((n) => renderTemplate`<div class="py-2 border-b border-white/5 last:border-0"> <p class="font-semibold text-sm">${n.title}</p> <p class="text-xs text-text-muted">${n.body}</p> <p class="text-xs text-text-muted mt-1">${new Date(n.created_at).toLocaleDateString("pt-BR")}</p> </div>`) : renderTemplate`<p class="text-text-muted text-sm">Nenhuma notificação</p>`} </div> </div> <div class="flex items-center gap-2"> <div class="w-8 h-8 rounded-full bg-gradient-to-br from-dourado to-dourado-claro flex items-center justify-center text-azul-profundo font-bold"> ${user?.full_name?.charAt(0).toUpperCase()} </div> <span class="hidden md:inline text-sm">${user?.full_name?.split(" ")[0]}</span> </div> <a href="/logout" class="text-text-muted hover:text-red-400 text-sm transition-colors">Sair</a> </div> </div> </header> <main class="max-w-7xl mx-auto px-4 py-8"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/layouts/StudentLayout.astro", void 0);

export { $$StudentLayout as $ };
