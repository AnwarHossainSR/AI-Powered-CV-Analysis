import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserDashboardData } from "@/lib/server-actions"
import { DashboardContent } from "@/components/dashboard-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your resumes and view analysis results",
}

export const revalidate = 60

async function DashboardData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { profile, resumes } = await getUserDashboardData(user.id)

  return <DashboardContent profile={profile} resumes={resumes} user={user} />
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <DashboardData />
    </Suspense>
  )
}
