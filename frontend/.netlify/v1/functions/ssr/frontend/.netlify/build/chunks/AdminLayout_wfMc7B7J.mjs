import { j as createComponent, n as renderHead, h as addAttribute, p as renderTemplate, o as renderSlot, i as createAstro } from './astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                              */

const $$Astro = createAstro();
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title = "Admin | WORKSHOP" } = Astro2.props;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/login");
  }
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "\u{1F4CA}", href: "/admin" },
    { id: "students", label: "Alunos", icon: "\u{1F465}", href: "/admin/students" },
    { id: "products", label: "Produtos", icon: "\u{1F4E6}", href: "/admin/products" },
    { id: "devices", label: "Dispositivos", icon: "\u{1F5A5}\uFE0F", href: "/admin/devices" },
    { id: "affiliates", label: "Afiliados", icon: "\u{1F91D}", href: "/admin/affiliates" },
    { id: "financial", label: "Financeiro", icon: "\u{1F4B0}", href: "/admin/financial" },
    { id: "messages", label: "Mensagens", icon: "\u{1F4E8}", href: "/admin/messages" },
    { id: "settings", label: "Configura\xE7\xF5es", icon: "\u2699\uFE0F", href: "/admin/settings" }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`<html lang="pt-BR"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-bg-dark text-text-light min-h-screen flex"> <aside class="w-64 bg-bg-card border-r border-white/5 flex flex-col fixed h-full"> <div class="p-6 border-b border-white/5"> <a href="/admin" class="block"> <h1 class="font-display text-2xl text-dourado">WORKSHOP</h1> <p class="text-sm text-text-muted mt-1">Painel Admin</p> </a> </div> <nav class="flex-1 p-4 space-y-1 overflow-y-auto"> ${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute([
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
    currentPath === item.href ? "bg-dourado/10 text-dourado" : "text-text-muted hover:bg-white/5 hover:text-text-light"
  ], "class:list")}> <span>${item.icon}</span> <span>${item.label}</span> </a>`)} </nav> <div class="p-4 border-t border-white/5"> <div class="flex items-center gap-3"> <div class="w-10 h-10 rounded-full bg-verde-principal flex items-center justify-center text-white font-bold"> ${user?.full_name?.charAt(0) || "A"} </div> <div class="flex-1 min-w-0"> <p class="text-sm font-medium text-text-light truncate">${user?.full_name}</p> <p class="text-xs text-text-muted">${user?.role}</p> </div> </div> <a href="/logout" class="block w-full mt-4 py-2 text-sm text-text-muted hover:text-text-light transition-colors text-center">
Sair
</a> </div> </aside> <main class="flex-1 ml-64"> <header class="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-bg-dark/80 backdrop-blur-sm sticky top-0 z-10"> <h2 class="text-xl font-semibold text-text-light">${title}</h2> </header> <div class="p-6"> ${renderSlot($$result, $$slots["default"])} </div> </main> </body></html>`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
