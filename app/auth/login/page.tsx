import LoginForm from "@/components/login-form";
import { getSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
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
