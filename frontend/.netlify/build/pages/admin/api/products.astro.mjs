import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const data = await request.json();
  const { data: product, error } = await supabaseAdmin.from("products").insert(data).select().single();
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  await supabaseAdmin.from("audit_log").insert({
    user_id: session.profile.id,
    action: "CREATE_PRODUCT",
    entity_type: "products",
    entity_id: product.id,
    details: { title: product.title }
  });
  return new Response(JSON.stringify({ success: true, id: product.id }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
