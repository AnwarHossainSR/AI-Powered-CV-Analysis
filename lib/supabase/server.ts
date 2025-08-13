import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config } from "../config";

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof config.supabaseUrl === "string" &&
  config.supabaseUrl.length > 0 &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseAnonKey.length > 0;

// Internal function to create Supabase client
export async function createClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase environment variables are not set. Using dummy client."
    );
    // Return a more complete dummy client that matches SupabaseClient interface
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      rpc: () => Promise.resolve({ data: null, error: null }),
    } as any;
  }

  return createServerClient(config.supabaseUrl!, config.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Direct auth helpers - use these instead of creating client instances
export async function getSession() {
  const supabase = await createClient();
  return supabase.auth.getSession();
}

export async function getUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

// For other operations, export the client creator
export { createClient as supabase };

// Also export the promise for direct awaiting
export const supabaseClient = createClient();
