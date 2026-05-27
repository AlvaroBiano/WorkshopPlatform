import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies, i as isAdmin } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile || !isAdmin(session.profile)) {
    return new Response("Forbidden", { status: 403 });
  }
  const { id } = await request.json();
  if (!id) return new Response("id is required", { status: 400 });
  const { data: pending, error: pendingError } = await supabaseAdmin.from("pending_registrations").select("*").eq("id", id).single();
  if (pendingError || !pending) {
    return new Response("Registro não encontrado", { status: 404 });
  }
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: pending.email,
    password: pending.cpf,
    email_confirm: true,
    user_metadata: { full_name: pending.full_name }
  });
  if (authError) {
    return new Response(authError.message, { status: 400 });
  }
  const { data: user, error: userError } = await supabaseAdmin.from("users").insert({
    auth_id: authUser.user.id,
    full_name: pending.full_name,
    email: pending.email,
    whatsapp: pending.whatsapp,
    role: "student",
    must_change_password: true,
    first_login: true,
    is_active: true
  }).select().single();
  if (userError) {
    return new Response(userError.message, { status: 500 });
  }
  if (pending.desired_product_id) {
    const { data: product } = await supabaseAdmin.from("products").select("price_cents").eq("id", pending.desired_product_id).single();
    const { data: order } = await supabaseAdmin.from("orders").insert({
      order_number: `WB-${Date.now()}`,
      user_id: user.id,
      product_id: pending.desired_product_id,
      amount_cents: product?.price_cents || 39700,
      status: "approved",
      approved_at: (/* @__PURE__ */ new Date()).toISOString(),
      approved_by: session.profile.id
    }).select().single();
    if (order) {
      await supabaseAdmin.from("product_access").insert({
        user_id: user.id,
        product_id: pending.desired_product_id,
        granted_at: (/* @__PURE__ */ new Date()).toISOString(),
        granted_by: session.profile.id
      });
    }
  }
  await supabaseAdmin.from("notifications").insert({
    user_id: user.id,
    type: "welcome",
    title: "Bem-vindo ao Workshop!",
    body: `Olá ${pending.full_name}! Seu acesso foi liberado. Sua senha inicial é seu CPF. Recomendamos alterá-la no primeiro acesso.`
  });
  await supabaseAdmin.from("pending_registrations").update({
    status: "approved",
    reviewed_by: session.profile.id,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id);
  await supabaseAdmin.from("audit_log").insert({
    user_id: session.profile.id,
    action: "APPROVE_STUDENT",
    entity_type: "pending_registrations",
    entity_id: id,
    details: { student_email: pending.email }
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
