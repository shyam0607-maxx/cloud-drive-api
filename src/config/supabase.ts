import { createClient } from "@supabase/supabase-js";
import { config } from "./env";

const initializeSupabase = () => {
  const url = config.supabase.url || process.env.SUPABASE_URL;
  const key = config.supabase.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = config.supabase.anonKey || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase config:", { url: !!url, key: !!key });
    throw new Error("Missing Supabase configuration");
  }

  return {
    client: createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
    public: createClient(url, anonKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
};

const { client: supabase, public: supabasePublic } = initializeSupabase();

export { supabase, supabasePublic };
