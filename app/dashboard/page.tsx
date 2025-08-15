import { DashboardContent } from "@/components/dashboard-content";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getUser } from "@/lib/queries";
import { getUserDashboardData } from "@/lib/server-actions";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your resumes and view analysis results",
};

export const revalidate = 60;

async function DashboardData() {
  const user = await getUser();

  const { profile, resumes } = await getUserDashboardData(user.id);

  return <DashboardContent profile={profile} resumes={resumes} user={user} />;
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
  );
}
