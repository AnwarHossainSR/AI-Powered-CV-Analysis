"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "./config";

// Helper to create Supabase client for server actions
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl!, config.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

// Update the signIn function to check if user is blocked
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    });

    if (error) {
      return { error: error.message };
    }

    // Check if user is blocked after successful authentication
    if (authData?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Error checking user profile:", profileError);
        // Sign out the user since we can't verify their status
        await supabase.auth.signOut();
        return { error: "Unable to verify account status. Please try again." };
      }

      if (profile?.is_blocked) {
        // Sign out the blocked user
        await supabase.auth.signOut();
        return {
          error:
            "Your account has been blocked. Please contact support for assistance.",
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Update the signUp function to handle potential null formData
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          config.devSupabaseRedirectUrl ||
          `${config.siteUrl || "http://localhost:3000"}/dashboard`,
        data: {
          full_name: fullName?.toString() || email.toString(),
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Check your email to confirm your account." };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/auth/login");
}
