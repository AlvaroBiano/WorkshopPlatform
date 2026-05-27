/* empty css                                      */
import { j as createComponent, r as renderComponent, p as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$StudentLayout } from '../chunks/StudentLayout_DWtYTFem.mjs';
import { s as supabaseAdmin } from '../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = Astro2.locals.user;
  if (!user) return Astro2.redirect("/login");
  const { data: access } = await supabaseAdmin.from("product_access").select(`
    product:products(
      id, title, slug, description, cover_url, type,
      modules(id, title, sort_order,
        lessons(id, duration_sec)
      )
    )
  `).eq("user_id", user.id);
  const { data: progress } = await supabaseAdmin.from("progress").select("lesson_id, completed, watched_sec").eq("user_id", user.id);
  const { data: continueWatching } = await supabaseAdmin.from("progress").select(`
    lesson_id,
    watched_sec,
    last_seen_at,
    lesson:lessons(
      id, title, duration_sec,
      module:modules(
        id, title,
        product:products(id, title, slug, cover_url)
      )
    )
  `).eq("user_id", user.id).eq("completed", false).gt("watched_sec", 0).order("last_seen_at", { ascending: false }).limit(5);
  Object.fromEntries(
    (progress || []).map((p) => [p.lesson_id, p])
  );
  const courses = (access || []).map((a) => {
    const product = a.product;
    const allLessons = product.modules?.flatMap((m) => m.lessons) || [];
    const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration_sec || 0), 0);
    const watchedDuration = (progress || []).filter((p) => allLessons.some((l) => l.id === p.lesson_id)).reduce((sum, p) => sum + (p.watched_sec || 0), 0);
    const percent = totalDuration ? Math.round(watchedDuration / totalDuration * 100) : 0;
    return { ...product, progress: percent };
  });
  return renderTemplate`${renderComponent($$result, "StudentLayout", $$StudentLayout, { "title": "Meus Cursos | WORKSHOP" }, { "default": async ($$result2) => renderTemplate`${continueWatching && continueWatching.length > 0 && renderTemplate`${maybeRenderHead()}<section class="mb-12"> <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2 text-dourado">
Continue assistindo
</h2> <div class="flex gap-4 overflow-x-auto pb-4"> ${continueWatching.map((cw) => renderTemplate`<a${addAttribute(`/student/course/${cw.lesson.module.product.slug}?lesson=${cw.lesson_id}`, "href")} class="flex-shrink-0 w-80 card group relative overflow-hidden"> <div class="aspect-video bg-bg-card relative"> ${cw.lesson.module.product.cover_url ? renderTemplate`<img${addAttribute(cw.lesson.module.product.cover_url, "src")} alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform">` : renderTemplate`<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-azul-profundo to-verde-principal"> <span class="text-4xl">🎓</span> </div>`} <div class="absolute inset-0 bg-gradient-to-t from-bg-dark/90 to-transparent flex items-end p-4"> <div class="w-full"> <p class="font-bold mb-1 text-sm">${cw.lesson.module.product.title}</p> <p class="text-xs text-text-muted mb-2">${cw.lesson.title}</p> <div class="h-1 bg-white/10 rounded overflow-hidden"> <div class="h-full bg-dourado"${addAttribute(`width: ${Math.min(100, (cw.watched_sec || 0) / (cw.lesson.duration_sec || 1) * 100)}%`, "style")}></div> </div> </div> </div> </div> </a>`)} </div> </section>`}<section> <h2 class="text-2xl font-display font-bold mb-4 text-dourado">Meus Cursos</h2> ${courses.length === 0 ? renderTemplate`<div class="text-center py-16"> <p class="text-text-muted text-lg">Nenhum curso disponível ainda.</p> <a href="/" class="text-dourado hover:underline mt-2 inline-block">Ver cursos disponíveis</a> </div>` : renderTemplate`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> ${courses.map((c) => renderTemplate`<a${addAttribute(`/student/course/${c.slug}`, "href")} class="card group overflow-hidden"> <div class="aspect-video bg-bg-card relative overflow-hidden"> ${c.cover_url ? renderTemplate`<img${addAttribute(c.cover_url, "src")}${addAttribute(c.title, "alt")} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">` : renderTemplate`<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-azul-profundo to-verde-principal"> <span class="text-5xl">🎓</span> </div>`} <div class="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"> <div class="w-16 h-16 rounded-full bg-dourado/90 flex items-center justify-center text-azul-profundo text-2xl">
▶
</div> </div> </div> <div class="p-4"> <span class="text-xs text-text-muted uppercase tracking-wide">${c.type}</span> <h3 class="font-bold mt-1 mb-3 line-clamp-2 group-hover:text-dourado transition-colors"> ${c.title} </h3> <div class="flex items-center gap-2 mb-2"> <div class="flex-1 h-1.5 bg-white/10 rounded overflow-hidden"> <div class="h-full bg-gradient-to-r from-verde-principal to-verde-claro"${addAttribute(`width: ${c.progress}%`, "style")}></div> </div> <span class="text-xs text-text-muted">${c.progress}%</span> </div> <p class="text-xs text-text-muted"> ${c.progress === 0 ? "N\xE3o iniciado" : c.progress === 100 ? "Conclu\xEDdo" : "Em andamento"} </p> </div> </a>`)} </div>`} </section> ` })}`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/index.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/index.astro";
const $$url = "/student";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
