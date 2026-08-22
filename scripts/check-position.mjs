import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const { data, error } = await supabase
  .from("article_images")
  .select("*")
  .eq("article_id", process.argv[2])
  .order("position");

console.log(JSON.stringify({ data, error }, null, 2));
