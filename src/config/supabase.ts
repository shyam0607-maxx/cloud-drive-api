import { createClient } from "@supabase/supabase-js";
import { config } from "./env";

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error("Missing Supabase configuration");
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const supabasePublic = createClient(
  config.supabase.url,
  config.supabase.anonKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
