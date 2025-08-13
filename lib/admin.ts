import { createClient } from "@/lib/supabase/server";

export async function checkAdminAccess(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .single();

  return !!adminUser;
}

export async function getAdminStats() {
  const supabase = await createClient();

  // Get user stats using the database function
  const { data: stats } = await supabase.rpc("get_user_stats");

  // Get revenue stats
  const { data: revenueData } = await supabase
    .from("credit_transactions")
    .select("amount, type, created_at")
    .eq("type", "purchase");

  const totalRevenue =
    revenueData?.reduce((sum: number, transaction: any) => {
      // Assuming $0.10 per credit for revenue calculation
      return sum + transaction.amount * 0.1;
    }, 0) || 0;

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentResumes } = await supabase
    .from("resumes")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    stats: stats?.[0] || {
      total_users: 0,
      active_users: 0,
      total_resumes: 0,
      total_credits_used: 0,
    },
    totalRevenue,
    recentUsers: recentUsers || [],
    recentResumes: recentResumes || [],
  };
}
