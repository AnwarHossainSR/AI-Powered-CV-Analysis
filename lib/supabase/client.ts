import { createBrowserClient } from "@supabase/ssr"
import { config } from "../config"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof config.supabaseUrl === "string" &&
  config.supabaseUrl.length > 0 &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseAnonKey.length > 0

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please check your environment variables.")
  }

  return createBrowserClient(config.supabaseUrl!, config.supabaseAnonKey!)
}

// Create a singleton instance of the Supabase client for Client Components
export const supabase = isSupabaseConfigured ? createBrowserClient(config.supabaseUrl!, config.supabaseAnonKey!) : null
