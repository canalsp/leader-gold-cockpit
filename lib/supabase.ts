import { createClient } from "@supabase/supabase-js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = required("SUPABASE_URL");
const supabaseServiceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");

export const postsTable = process.env.SUPABASE_POSTS_TABLE ?? "posts";

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
