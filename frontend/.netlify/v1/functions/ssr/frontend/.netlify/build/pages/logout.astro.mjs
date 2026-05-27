/* empty css                                      */
import { j as createComponent, p as renderTemplate, i as createAstro } from '../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Logout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logout;
  const user = Astro2.locals.user;
  if (user) {
    if (user.role === "admin" || user.role === "super_admin") {
      return Astro2.redirect("/admin");
    }
    return Astro2.redirect("/student");
  }
  return renderTemplate``;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/logout.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/logout.astro";
const $$url = "/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
