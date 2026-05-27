/* empty css                                            */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_wfMc7B7J.mjs';
export { renderers } from '../../../renderers.mjs';

const $$New = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Novo Produto" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-display font-bold text-dourado">Novo Produto</h1> <a href="/admin/products" class="btn btn-secondary">Voltar</a> </div> <form id="productForm" class="space-y-6"> <div class="card p-6"> <h2 class="font-bold text-dourado mb-4">Informações Básicas</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-text-muted mb-2">Título</label> <input type="text" id="title" class="input" required> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Slug</label> <input type="text" id="slug" class="input" required placeholder="meu-workshop"> </div> <div class="md:col-span-2"> <label class="block text-sm font-medium text-text-muted mb-2">Descrição</label> <textarea id="description" class="input" rows="3"></textarea> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Preço (centavos)</label> <input type="number" id="price_cents" class="input" value="39700" required> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Tipo</label> <select id="type" class="input"> <option value="workshop">Workshop</option> <option value="course">Curso</option> <option value="ebook">Ebook</option> </select> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Status</label> <select id="status" class="input"> <option value="draft">Rascunho</option> <option value="published">Publicado</option> </select> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">URL da Capa</label> <input type="url" id="cover_url" class="input"> </div> <div> <label class="block text-sm font-medium text-text-muted mb-2">Comissão Afiliado (%)</label> <input type="number" id="affiliate_commission_pct" class="input" value="40" step="0.01"> </div> <div class="flex items-center gap-2"> <input type="checkbox" id="is_affiliable" checked> <label for="is_affiliable" class="text-sm text-text-muted">Disponível para afiliados</label> </div> </div> </div> <div id="errorMsg" class="hidden p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400"></div> <div id="successMsg" class="hidden p-3 rounded-lg text-sm bg-verde-claro/10 border border-verde-claro/30 text-verde-claro"></div> <div class="flex justify-end gap-4"> <a href="/admin/products" class="btn btn-secondary">Cancelar</a> <button type="submit" class="btn btn-primary">Criar Produto</button> </div> </form> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/products/new.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/products/new.astro";
const $$url = "/admin/products/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
