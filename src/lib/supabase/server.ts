import type { Database } from "@/lib/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = SupabaseClient<Database>;

export async function createServerClient(): Promise<AppSupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const { createServerClient: createSupabaseServerClient } = await import(
    "@supabase/ssr"
  );
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  });
}

export async function requireSupabaseClient(): Promise<AppSupabaseClient> {
  const supabase = await createServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}
