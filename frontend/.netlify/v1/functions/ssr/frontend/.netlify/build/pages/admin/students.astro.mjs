/* empty css                                         */
import { j as createComponent, r as renderComponent, p as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_OhfOa5GV.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_wfMc7B7J.mjs';
import { s as supabaseAdmin } from '../../chunks/supabase-server_96w9zyaM.mjs';
export { renderers } from '../../renderers.mjs';

const $$Students = createComponent(async ($$result, $$props, $$slots) => {
  const { data: students } = await supabaseAdmin.from("users").select("*, orders(*, product:products(title))").eq("role", "student").order("created_at", { ascending: false });
  const { data: pendingStudents } = await supabaseAdmin.from("pending_registrations").select("*").order("created_at", { ascending: false });
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Alunos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex justify-between items-center mb-6"> <h1 class="text-2xl font-display font-bold text-dourado">Gestão de Alunos</h1> <input type="text" placeholder="Buscar por nome/email..." class="input max-w-xs" id="search"> </div> ${pendingStudents && pendingStudents.length > 0 && renderTemplate`<section class="card p-6 mb-6 border-l-4 border-l-dourado"> <h2 class="text-lg font-bold text-dourado mb-4">Cadastros Pendentes (${pendingStudents.length})</h2> <div class="space-y-3"> ${pendingStudents.map((s) => renderTemplate`<div class="flex items-center justify-between p-4 bg-white/5 rounded-lg"> <div> <p class="font-semibold">${s.full_name}</p> <p class="text-sm text-text-muted">${s.email} · CPF: ${s.cpf} · WhatsApp: ${s.whatsapp}</p> ${s.payment_proof_url && renderTemplate`<a${addAttribute(s.payment_proof_url, "href")} target="_blank" class="text-xs text-dourado hover:underline">Ver comprovante</a>`} </div> <div class="flex gap-2"> <button${addAttribute(`approveStudent('${s.id}')`, "onclick")} class="px-4 py-2 bg-verde-principal text-white rounded-lg text-sm">
Aprovar
</button> <button${addAttribute(`rejectStudent('${s.id}')`, "onclick")} class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
Rejeitar
</button> </div> </div>`)} </div> </section>`}<div class="card overflow-hidden"> <table class="w-full text-sm"> <thead class="bg-white/5 text-text-muted"> <tr> <th class="text-left p-4">Aluno</th> <th class="text-left p-4">CPF</th> <th class="text-left p-4">WhatsApp</th> <th class="text-left p-4">Produtos</th> <th class="text-left p-4">Status</th> <th class="text-left p-4">Ações</th> </tr> </thead> <tbody id="studentsTable"> ${(students || []).map((s) => renderTemplate`<tr class="border-t border-white/5 hover:bg-white/5"${addAttribute(`${s.full_name} ${s.email}`.toLowerCase(), "data-search")}> <td class="p-4"> <p class="font-semibold">${s.full_name}</p> <p class="text-xs text-text-muted">${s.email}</p> </td> <td class="p-4 font-mono text-xs">${s.cpf_hash ? "***" : "\u2014"}</td> <td class="p-4">${s.whatsapp || "\u2014"}</td> <td class="p-4">${s.orders?.length || 0}</td> <td class="p-4"> ${s.banned_at ? renderTemplate`<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Banido</span>` : renderTemplate`<span class="px-2 py-1 bg-verde-claro/20 text-verde-claro rounded text-xs">Ativo</span>`} </td> <td class="p-4"> <div class="flex gap-2"> <a${addAttribute(`/admin/devices?user=${s.id}`, "href")} class="text-xs text-dourado hover:underline">Dispositivos</a> <button${addAttribute(`toggleBan('${s.id}', ${!s.banned_at})`, "onclick")} class="text-xs text-red-400 hover:underline"> ${s.banned_at ? "Reativar" : "Banir"} </button> </div> </td> </tr>`)} ${(!students || students.length === 0) && renderTemplate`<tr> <td colspan="6" class="p-8 text-center text-text-muted">Nenhum aluno cadastrado</td> </tr>`} </tbody> </table> </div> ` })} `;
}, "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/students.astro", void 0);

const $$file = "/Users/alvarobiano/Desktop/WorkshopPlatform/frontend/src/pages/admin/students.astro";
const $$url = "/admin/students";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Students,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
