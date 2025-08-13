import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { config } from "../config";

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof config.supabaseUrl === "string" &&
  config.supabaseUrl.length > 0 &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseAnonKey.length > 0;

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  const cookieStore = cookies();

  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase environment variables are not set. Using dummy client."
    );
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
      },
    };
  }

  return createServerComponentClient({ cookies: () => cookieStore });
});
