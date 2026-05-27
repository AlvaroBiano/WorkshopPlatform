/* empty css                                            */
import { j as createComponent, p as renderTemplate, l as defineScriptVars, r as renderComponent, i as createAstro, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$StudentLayout } from '../../../chunks/StudentLayout_DWtYTFem.mjs';
import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const user = Astro2.locals.user;
  if (!user) return Astro2.redirect("/login");
  const slug = Astro2.params.slug;
  const requestedLessonId = Astro2.url.searchParams.get("lesson");
  const { data: product } = await supabaseAdmin.from("products").select(`
    *,
    modules(
      id, title, sort_order,
      lessons(id, title, sort_order, type, vimeo_id, youtube_url, file_url, duration_sec, description, is_free)
    )
  `).eq("slug", slug).single();
  if (!product) return new Response("N\xE3o encontrado", { status: 404 });
  const { data: access } = await supabaseAdmin.from("product_access").select("*").eq("user_id", user.id).eq("product_id", product.id).single();
  if (!access) return Astro2.redirect("/student?error=no_access");
  const { data: progress } = await supabaseAdmin.from("progress").select("*").eq("user_id", user.id);
  const progressMap = Object.fromEntries(
    (progress || []).map((p) => [p.lesson_id, p])
  );
  const allLessons = (product.modules || []).sort((a, b) => a.sort_order - b.sort_order).flatMap(
    (m) => m.lessons.sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id }))
  );
  let currentLesson = requestedLessonId ? allLessons.find((l) => l.id === requestedLessonId) : allLessons.find((l) => !progressMap[l.id]?.completed) || allLessons[0];
  if (!currentLesson) currentLesson = allLessons[0];
  const completedCount = allLessons.filter((l) => progressMap[l.id]?.completed).length;
  const totalCount = allLessons.length;
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  let watchedSec = 0\n  let startTime = Date.now()\n\n  setInterval(() => {\n    watchedSec = Math.floor((Date.now() - startTime) / 1000)\n    fetch('/student/api/progress', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        lessonId,\n        watchedSec,\n        lastPositionSec: watchedSec,\n      }),\n    }).catch(() => {})\n  }, 15000)\n\n  document.getElementById('markComplete')?.addEventListener('click', async () => {\n    const btn = document.getElementById('markComplete') as HTMLButtonElement\n    btn.disabled = true\n    btn.textContent = 'Salvando...'\n\n    const res = await fetch('/student/api/progress', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        lessonId,\n        watchedSec,\n        lastPositionSec: watchedSec,\n        completed: true,\n      }),\n    })\n\n    if (res.ok) {\n      btn.textContent = '\u2713 Conclu\xEDda'\n      setTimeout(() => location.reload(), 500)\n    } else {\n      btn.textContent = 'Erro. Tente novamente.'\n      btn.disabled = false\n    }\n  })\n\n  document.addEventListener('keydown', (e) => {\n    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return\n\n    const links = Array.from(document.querySelectorAll('aside a'))\n    const currentIdx = links.findIndex(l => l.href.includes(lessonId))\n\n    if (e.key === 'ArrowRight' && links[currentIdx + 1]) {\n      location.href = links[currentIdx + 1].href\n    }\n    if (e.key === 'ArrowLeft' && links[currentIdx - 1]) {\n      location.href = links[currentIdx - 1].href\n    }\n  })\n})();<\/script>"])), renderComponent($$result, "StudentLayout", $$StudentLayout, { "title": `${currentLesson.title} | WORKSHOP` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6"> <div> <div class="aspect-video bg-black rounded-xl overflow-hidden mb-4"> ${currentLesson.type === "vimeo" && currentLesson.vimeo_id ? renderTemplate`<iframe${addAttribute(`https://player.vimeo.com/video/${currentLesson.vimeo_id}?autoplay=1`, "src")} class="w-full h-full" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` : currentLesson.type === "youtube" && currentLesson.youtube_url ? renderTemplate`<iframe${addAttribute(`https://www.youtube.com/embed/${new URL(currentLesson.youtube_url).searchParams.get("v")}?autoplay=1`, "src")} class="w-full h-full" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : currentLesson.type === "pdf" && currentLesson.file_url ? renderTemplate`<iframe${addAttribute(currentLesson.file_url, "src")} class="w-full h-full"></iframe>` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-text-muted"> <p>Conteúdo: ${currentLesson.type}</p> </div>`} </div> <div class="card p-6"> <h1 class="text-2xl font-display font-bold text-dourado mb-2">${currentLesson.title}</h1> ${currentLesson.description && renderTemplate`<p class="text-text-muted mb-4">${currentLesson.description}</p>`} <div class="flex flex-wrap gap-3"> <button id="markComplete" class="btn btn-primary"> ${progressMap[currentLesson.id]?.completed ? "\u2713 Conclu\xEDda" : "\u2713 Marcar como conclu\xEDda"} </button> ${currentLesson.file_url && renderTemplate`<a${addAttribute(currentLesson.file_url, "href")} target="_blank" class="btn btn-secondary">
Baixar Material
</a>`} </div> </div> </div> <aside class="card max-h-[calc(100vh-120px)] overflow-y-auto"> <div class="p-4 border-b border-white/5 sticky top-0 bg-bg-card z-10"> <h2 class="font-bold text-dourado">${product.title}</h2> <p class="text-xs text-text-muted mt-1"> ${completedCount} de ${totalCount} aulas concluídas
</p> <div class="h-1.5 bg-white/10 rounded mt-2 overflow-hidden"> <div class="h-full bg-gradient-to-r from-verde-principal to-verde-claro"${addAttribute(`width: ${totalCount ? Math.round(completedCount / totalCount * 100) : 0}%`, "style")}></div> </div> </div> ${(product.modules || []).sort((a, b) => a.sort_order - b.sort_order).map((m, mi) => renderTemplate`<div> <div class="px-4 py-3 bg-white/5 sticky top-[89px]"> <h3 class="font-semibold text-sm"> <span class="text-dourado">M${mi + 1}</span> · ${m.title} </h3> </div> ${m.lessons.sort((a, b) => a.sort_order - b.sort_order).map((l, li) => {
    const prog = progressMap[l.id];
    const isCurrent = l.id === currentLesson.id;
    return renderTemplate`<a${addAttribute(`/student/course/${slug}?lesson=${l.id}`, "href")}${addAttribute([
      "flex items-start gap-3 px-4 py-3 border-l-2 hover:bg-white/5 transition-colors",
      isCurrent ? "border-l-dourado bg-white/5" : "border-l-transparent"
    ], "class:list")}> <div${addAttribute([
      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
      prog?.completed ? "bg-verde-claro text-white" : isCurrent ? "bg-dourado text-azul-profundo" : "bg-white/10 text-text-muted"
    ], "class:list")}> ${prog?.completed ? "\u2713" : li + 1} </div> <div class="flex-1 min-w-0"> <p${addAttribute(["text-sm", isCurrent ? "text-dourado font-semibold" : ""], "class:list")}> ${l.title} </p> <p class="text-xs text-text-muted mt-0.5"> ${Math.floor((l.duration_sec || 0) / 60)} min
${prog?.watched_sec > 0 && !prog.completed && renderTemplate`<span class="ml-2 text-dourado">
· ${Math.floor(prog.watched_sec / 60)}min assistidos
</span>`} </p> </div> </a>`;
  })} </div>`)} </aside> </div> ` }), defineScriptVars({ lessonId: currentLesson?.id, userId: user?.id, slug }));
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/course/[slug].astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/student/course/[slug].astro";
const $$url = "/student/course/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
