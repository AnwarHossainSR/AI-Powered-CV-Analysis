import LoginForm from "@/components/login-form";
import { getSession } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Connect Supabase to get started
        </h1>
      </div>
    );
  }

  // Check if user is already logged in
  const {
    data: { session },
  } = await getSession();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
