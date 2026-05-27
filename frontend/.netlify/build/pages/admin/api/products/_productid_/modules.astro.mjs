import { s as supabaseAdmin } from '../../../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../../../renderers.mjs';

const POST = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const productId = params.productId;
  const { title } = await request.json();
  if (!title) {
    return new Response("title is required", { status: 400 });
  }
  const { count } = await supabaseAdmin.from("modules").select("*", { count: "exact", head: true }).eq("product_id", productId);
  const { data: module, error } = await supabaseAdmin.from("modules").insert({
    product_id: productId,
    title,
    sort_order: (count || 0) + 1
  }).select().single();
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, id: module.id }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
