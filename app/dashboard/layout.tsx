"use client"

import type React from "react"
import { useEffect, useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile } from "@/lib/queries"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const profileData = await getUserProfile(user.id)
        setProfile(profileData)
      } catch (error) {
        console.error("[v0] Profile loading error:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (loading || profileLoading || !user) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile?.credits || 0} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
