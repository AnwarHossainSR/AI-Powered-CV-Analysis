import DashboardNav from "@/components/dashboard-nav"
import { createClient } from "@/lib/supabase/server"
import type React from "react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get user (middleware ensures user exists and has admin access)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile for credits display
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user!} credits={profile?.credits || 0} />
      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
