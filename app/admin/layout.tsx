import type React from "react"
import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import AdminNav from "@/components/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id)
  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main>{children}</main>
    </div>
  )
}
