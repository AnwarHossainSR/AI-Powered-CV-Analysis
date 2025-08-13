// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { config } from "../config";
import { isSupabaseConfigured } from "../utils";

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

// For use in Middleware - separate function that accepts request
export async function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase is not configured in middleware. Please add your Supabase URL and anon key to your environment variables."
    );
    return { supabase: null, response: supabaseResponse };
  }

  const supabase = createServerClient(
    config.supabaseUrl!,
    config.supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}

// For use in Route Handlers (API routes)
export async function createRouteHandlerClient(request: NextRequest) {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase is not configured. Please add your Supabase URL and anon key to your environment variables."
    );
    throw new Error("Supabase configuration missing");
  }

  return createServerClient(config.supabaseUrl!, config.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Route handlers can't set cookies directly
        // You'll need to handle this in the response
        console.warn("Setting cookies in route handler - handle in response");
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

// Export configuration check function (not the boolean itself)
export async function getSupabaseConfig() {
  return {
    isConfigured: isSupabaseConfigured,
    url: config.supabaseUrl,
    hasAnonKey: Boolean(config.supabaseAnonKey),
  };
}

// For other operations, export the client creator (alias)
export { createClient as supabase };
