"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import DashboardNav from "@/components/dashboard-nav"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading, refreshUser } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/login")
    }
  }, [user, loading])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
