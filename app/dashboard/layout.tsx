"use client";

import type React from "react";

import DashboardNav from "@/components/dashboard-nav";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/queries";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, refreshUser } = useAuth();
  const profile = await getUserProfile(user!.id);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user!} credits={profile?.credits || 0} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
