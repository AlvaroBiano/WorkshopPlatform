import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const { id, action } = await request.json();
  if (!id || !action) return new Response("id and action are required", { status: 400 });
  if (action === "approve") {
    await supabaseAdmin.from("affiliates").update({
      status: "active",
      approved_at: (/* @__PURE__ */ new Date()).toISOString(),
      approved_by: session.profile.id
    }).eq("id", id);
  } else if (action === "block") {
    await supabaseAdmin.from("affiliates").update({ status: "blocked" }).eq("id", id);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
