import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
if (usersError) throw new Error(`listUsers: ${usersError.message}`);

const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");
if (profilesError) throw new Error(`profiles: ${profilesError.message}`);

console.log(JSON.stringify(
  {
    authUsers: users.users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at })),
    profiles,
  },
  null,
  2
));
