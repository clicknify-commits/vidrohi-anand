import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = process.argv[2];
const displayName = process.argv[3] ?? "Admin";
const password = process.env.ADMIN_NEW_PASSWORD;
if (!email || !password) throw new Error("usage: create-admin.mjs <email> [display_name]  (password via ADMIN_NEW_PASSWORD env var)");

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (createError) throw new Error(`createUser: ${createError.message}`);

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .insert({ user_id: created.user.id, display_name: displayName, role: "admin" })
  .select()
  .single();
if (profileError) throw new Error(`profile insert: ${profileError.message}`);

console.log(JSON.stringify({ id: created.user.id, email: created.user.email, profile }));
