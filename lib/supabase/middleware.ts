import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { config } from "../config";
import { isSupabaseConfigured } from "../utils";

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // Check if this is an auth callback
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname === "/auth/callback";

  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/pricing") ||
    request.nextUrl.pathname.startsWith("/features") ||
    request.nextUrl.pathname.startsWith("/about");

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Handle protected routes
  if (isProtectedRoute && !isAuthRoute) {
    if (!user) {
      const redirectUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if authenticated user is blocked
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error checking user profile in middleware:", profileError);
      // If we can't check the profile, sign them out for safety
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    if (profile?.is_blocked) {
      // User is blocked - sign them out and redirect to login with message
      const response = NextResponse.redirect(
        new URL("/auth/login?blocked=true", request.url)
      );
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }
  }

  // Handle admin routes with role checking
  if (isAdminRoute && !isAuthRoute) {
    if (!user) {
      const redirectUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // First check if user is blocked (same logic as protected routes)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Error checking user profile in admin middleware:",
        profileError
      );
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    if (profile?.is_blocked) {
      const response = NextResponse.redirect(
        new URL("/auth/login?blocked=true", request.url)
      );
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "super_admin") {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
