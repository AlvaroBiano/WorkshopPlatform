import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { lessonId, watchedSec, lastPositionSec, completed } = await request.json();
  if (!lessonId) {
    return new Response("lessonId is required", { status: 400 });
  }
  const { error } = await supabaseAdmin.from("progress").upsert({
    user_id: session.profile.id,
    lesson_id: lessonId,
    watched_sec: watchedSec || 0,
    completed: completed || false,
    last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,lesson_id"
  });
  if (error) {
    return new Response(error.message, { status: 500 });
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
