import AdminNav from "@/components/admin-nav";
import type React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // removed authentication checks as they're now handled in middleware
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50/30 to-gray-100/20">
      <AdminNav />
      {/* updated main layout for proper sidebar spacing */}
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
