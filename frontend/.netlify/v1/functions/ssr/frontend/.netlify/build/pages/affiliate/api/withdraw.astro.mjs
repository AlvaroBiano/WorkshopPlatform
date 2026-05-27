import { s as supabaseAdmin } from '../../../chunks/supabase-server_96w9zyaM.mjs';
import { g as getSessionFromCookies } from '../../../chunks/auth_hieNb78E.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const session = await getSessionFromCookies(cookies);
  if (!session?.profile) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { amountCents } = await request.json();
  if (!amountCents || amountCents < 1e4) {
    return new Response("Valor mínimo: R$ 100", { status: 400 });
  }
  const { data: affiliate } = await supabaseAdmin.from("affiliates").select("*").eq("user_id", session.profile.id).single();
  if (!affiliate) {
    return new Response("Afiliado não encontrado", { status: 404 });
  }
  if (affiliate.balance_cents < amountCents) {
    return new Response("Saldo insuficiente", { status: 400 });
  }
  const { error } = await supabaseAdmin.from("affiliate_withdrawals").insert({
    affiliate_id: affiliate.id,
    amount_cents: amountCents,
    pix_key: affiliate.pix_key,
    status: "requested"
  });
  if (error) {
    return new Response(error.message, { status: 500 });
  }
  await supabaseAdmin.from("affiliates").update({ balance_cents: affiliate.balance_cents - amountCents }).eq("id", affiliate.id);
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
