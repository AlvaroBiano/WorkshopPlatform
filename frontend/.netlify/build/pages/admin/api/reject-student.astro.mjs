import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const { id, reason } = await request.json();
  if (!id) return new Response("id is required", { status: 400 });
  await supabaseAdmin.from("pending_registrations").update({
    status: "rejected",
    reviewed_by: session.profile.id,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
    rejection_reason: reason || null
  }).eq("id", id);
  await supabaseAdmin.from("audit_log").insert({
    user_id: session.profile.id,
    action: "REJECT_STUDENT",
    entity_type: "pending_registrations",
    entity_id: id,
    details: { reason }
  });
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
