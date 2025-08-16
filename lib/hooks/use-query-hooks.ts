"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const queryKeys = {
  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "users", id] as const,
  billingPlans: ["admin", "billing-plans"] as const,
  settings: ["admin", "settings"] as const,
  dashboard: (userId: string) => ["dashboard", userId] as const,
  resumes: (userId: string) => ["resumes", userId] as const,
}

export function useAdminUsers(filters?: {
  search?: string
  status?: string
  subscription?: string
}) {
  return useQuery({
    queryKey: [...queryKeys.users, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.search) params.append("search", filters.search)
      if (filters?.status && filters.status !== "all") params.append("status", filters.status)
      if (filters?.subscription && filters.subscription !== "all") params.append("subscription", filters.subscription)

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin data
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update user")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success("User updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update user")
    },
  })
}

export function useBillingPlans() {
  return useQuery({
    queryKey: queryKeys.billingPlans,
    queryFn: async () => {
      const response = await fetch("/api/admin/billing-plans")
      if (!response.ok) throw new Error("Failed to fetch billing plans")
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for billing plans
  })
}

export function useDashboardData(userId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(userId),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${userId}`)
      if (!response.ok) throw new Error("Failed to fetch dashboard data")
      return response.json()
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes for dashboard data
  })
}
