import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createBrowserClient<Database>(env.url, env.anonKey);
}
