"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cache } from "react"

export const getUserDashboardData = cache(async (userId: string) => {
  const supabase = await createClient()

  const [profileResult, resumesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("resumes").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ])

  return {
    profile: profileResult.data,
    resumes: resumesResult.data || [],
  }
})

export const getAdminDashboardData = cache(async () => {
  const supabase = await createClient()

  const [statsResult, usersResult, resumesResult] = await Promise.all([
    supabase.rpc("get_admin_stats"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("resumes").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(5),
  ])

  return {
    stats: statsResult.data || {},
    recentUsers: usersResult.data || [],
    recentResumes: resumesResult.data || [],
  }
})

export async function updateUserProfile(userId: string, data: { full_name?: string }) {
  const supabase = await createClient()

  const { error } = await supabase.from("profiles").update(data).eq("id", userId)

  if (error) throw error

  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function updateUserCredits(
  userId: string,
  amount: number,
  type: "purchase" | "usage" | "bonus",
  description: string,
) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("update_user_credits", {
    user_uuid: userId,
    credit_amount: amount,
    transaction_type: type,
    description_text: description,
  })

  if (error) throw error

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/billing")
  return { success: true }
}

export async function deleteResume(resumeId: string, userId: string) {
  const supabase = await createClient()

  // Delete from resumes table (cascade will handle parsed_data)
  const { error } = await supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", userId)

  if (error) throw error

  revalidatePath("/dashboard/resumes")
  return { success: true }
}

export async function createBillingPlan(planData: {
  name: string
  description: string
  price: number
  currency: string
  interval_type: string
  credits?: number
  features?: string[]
  stripe_product_id: string
  stripe_price_id: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("billing_plans")
    .insert({
      ...planData,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/billing-plans")
  revalidatePath("/pricing")
  return data
}
