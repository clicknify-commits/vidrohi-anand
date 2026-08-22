import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const userId = process.argv[2];
const newPassword = process.env.ADMIN_NEW_PASSWORD;
if (!userId || !newPassword) throw new Error("usage: set-admin-password.mjs <user_id>  (password via ADMIN_NEW_PASSWORD env var)");

const { data, error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
if (error) throw new Error(`updateUserById: ${error.message}`);

console.log(JSON.stringify({ id: data.user.id, email: data.user.email, updated: true }));
