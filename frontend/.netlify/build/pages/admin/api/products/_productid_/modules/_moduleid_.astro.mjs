import { s as supabaseAdmin } from '../../../../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../../../../renderers.mjs';

const DELETE = async ({ params, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const moduleId = params.moduleId;
  const { error } = await supabaseAdmin.from("modules").delete().eq("id", moduleId);
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
