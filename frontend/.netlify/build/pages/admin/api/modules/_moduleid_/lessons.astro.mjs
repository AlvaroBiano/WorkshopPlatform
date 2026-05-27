import { s as supabaseAdmin } from '../../../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../../../renderers.mjs';

const POST = async ({ request, params, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const moduleId = params.moduleId;
  const data = await request.json();
  if (!data.title) {
    return new Response("title is required", { status: 400 });
  }
  const { count } = await supabaseAdmin.from("lessons").select("*", { count: "exact", head: true }).eq("module_id", moduleId);
  const { data: lesson, error } = await supabaseAdmin.from("lessons").insert({
    module_id: moduleId,
    title: data.title,
    type: data.type || "vimeo",
    duration_sec: data.duration_sec || 0,
    sort_order: (count || 0) + 1,
    vimeo_id: data.vimeo_id || null,
    youtube_url: data.youtube_url || null,
    file_url: data.file_url || null,
    description: data.description || null
  }).select().single();
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return new Response(JSON.stringify({ success: true, id: lesson.id }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
