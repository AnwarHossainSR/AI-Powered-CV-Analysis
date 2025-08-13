import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { config } from "../config";

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof config.supabaseUrl === "string" &&
  config.supabaseUrl.length > 0 &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseAnonKey.length > 0;

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient();
