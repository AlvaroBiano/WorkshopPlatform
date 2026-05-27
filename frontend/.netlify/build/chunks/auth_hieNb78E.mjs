import { c as createClient, s as supabaseAdmin } from './supabase-server_96w9zyaM.mjs';

{
  console.warn("Missing Supabase environment variables");
}
createClient(
  "http://localhost:54321",
  "placeholder-key"
);

async function getSessionFromCookies(cookies) {
  const accessToken = cookies.get("sb-access-token")?.value;
  cookies.get("sb-refresh-token")?.value;
  if (!accessToken) return null;
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) return null;
    const { data: profile } = await supabaseAdmin.from("users").select("*").eq("auth_id", user.id).single();
    return { user, profile };
  } catch {
    return null;
  }
}
function isAdmin(profile) {
  return profile?.role === "admin" || profile?.role === "super_admin";
}

export { getSessionFromCookies as g, isAdmin as i };
