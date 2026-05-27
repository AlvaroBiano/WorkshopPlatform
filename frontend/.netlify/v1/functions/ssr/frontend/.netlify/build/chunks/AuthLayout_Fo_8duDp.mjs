import { j as createComponent, n as renderHead, o as renderSlot, p as renderTemplate, i as createAstro } from './astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                            */

const $$Astro = createAstro();
const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthLayout;
  const { title = "WORKSHOP | Grupo Braga & Biano" } = Astro2.props;
  return renderTemplate`<html lang="pt-BR"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-bg-dark text-text-light min-h-screen"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/layouts/AuthLayout.astro", void 0);

export { $$AuthLayout as $ };
