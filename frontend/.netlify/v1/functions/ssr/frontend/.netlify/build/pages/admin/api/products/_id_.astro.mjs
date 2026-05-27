import { s as supabaseAdmin } from '../../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../../renderers.mjs';

const PUT = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const productId = params.id;
  const data = await request.json();
  const { error } = await supabaseAdmin.from("products").update(data).eq("id", productId);
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  await supabaseAdmin.from("audit_log").insert({
    user_id: session.profile.id,
    action: "UPDATE_PRODUCT",
    entity_type: "products",
    entity_id: productId,
    details: data
  });
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};
const DELETE = async ({ params, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const productId = params.id;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
