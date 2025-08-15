import DashboardNav from "@/components/dashboard-nav";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getUser, getUserProfile } from "@/lib/queries";

import type React from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) {
    return <LoadingScreen />;
  }

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits || 0} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
