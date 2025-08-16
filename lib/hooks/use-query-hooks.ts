import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const QUERY_KEYS = {
  users: ["users"] as const,
  user: (id: string) => ["user", id] as const,
  userProfile: (id: string) => ["userProfile", id] as const,
  userResumes: (id: string) => ["userResumes", id] as const,
  userDashboard: (id: string) => ["userDashboard", id] as const,
  billingPlans: ["billingPlans"] as const,
  billingPlan: (id: string) => ["billingPlan", id] as const,
  stripeProducts: ["stripeProducts"] as const,
  adminUsers: (filters?: any) => ["adminUsers", filters] as const,
  adminSettings: ["adminSettings"] as const,
  resume: (id: string) => ["resume", id] as const,
  transactions: (userId: string) => ["transactions", userId] as const,
}

const api = {
  // User queries
  fetchUser: async () => {
    const response = await fetch("/api/user")
    if (!response.ok) throw new Error("Failed to fetch user")
    return response.json()
  },

  fetchUserProfile: async (userId: string) => {
    const response = await fetch(`/api/user/profile?userId=${userId}`)
    if (!response.ok) throw new Error("Failed to fetch user profile")
    return response.json()
  },

  fetchUserResumes: async (userId: string) => {
    const response = await fetch(`/api/user/resumes?userId=${userId}`)
    if (!response.ok) throw new Error("Failed to fetch user resumes")
    return response.json()
  },

  fetchUserDashboard: async (userId: string) => {
    const response = await fetch(`/api/user/dashboard?userId=${userId}`)
    if (!response.ok) throw new Error("Failed to fetch dashboard data")
    return response.json()
  },

  // Admin queries
  fetchAdminUsers: async (filters?: any) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/admin/users?${params}`)
    if (!response.ok) throw new Error("Failed to fetch users")
    return response.json()
  },

  fetchBillingPlans: async () => {
    const response = await fetch("/api/admin/billing-plans")
    if (!response.ok) throw new Error("Failed to fetch billing plans")
    return response.json()
  },

  fetchBillingPlan: async (id: string) => {
    const response = await fetch(`/api/admin/billing-plans/${id}`)
    if (!response.ok) throw new Error("Failed to fetch billing plan")
    return response.json()
  },

  fetchStripeProducts: async () => {
    const response = await fetch("/api/admin/stripe-plans")
    if (!response.ok) throw new Error("Failed to fetch Stripe products")
    return response.json()
  },

  fetchAdminSettings: async () => {
    const response = await fetch("/api/admin/settings")
    if (!response.ok) throw new Error("Failed to fetch settings")
    return response.json()
  },

  fetchResume: async (id: string) => {
    const response = await fetch(`/api/resumes/${id}`)
    if (!response.ok) throw new Error("Failed to fetch resume")
    return response.json()
  },

  // Mutations
  updateUser: async (data: any) => {
    const response = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update user")
    return response.json()
  },

  updateBillingPlan: async ({ id, data }: { id: string; data: any }) => {
    const response = await fetch(`/api/admin/billing-plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update billing plan")
    return response.json()
  },

  deleteBillingPlan: async (id: string) => {
    const response = await fetch(`/api/admin/billing-plans/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete billing plan")
    return response.json()
  },

  updateAdminSettings: async (settings: any) => {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    })
    if (!response.ok) throw new Error("Failed to update settings")
    return response.json()
  },
}

export const useUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: api.fetchUser,
    staleTime: 10 * 60 * 1000, // 10 minutes for user data
  })
}

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile(userId),
    queryFn: () => api.fetchUserProfile(userId),
    enabled: !!userId,
  })
}

export const useUserResumes = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userResumes(userId),
    queryFn: () => api.fetchUserResumes(userId),
    enabled: !!userId,
  })
}

export const useUserDashboard = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.userDashboard(userId),
    queryFn: () => api.fetchUserDashboard(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
  })
}

export const useAdminUsers = (filters?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(filters),
    queryFn: () => api.fetchAdminUsers(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for admin data
  })
}

export const useBillingPlans = () => {
  return useQuery({
    queryKey: QUERY_KEYS.billingPlans,
    queryFn: api.fetchBillingPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes for billing plans
  })
}

export const useBillingPlan = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.billingPlan(id),
    queryFn: () => api.fetchBillingPlan(id),
    enabled: !!id,
  })
}

export const useStripeProducts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stripeProducts,
    queryFn: api.fetchStripeProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes for Stripe data
  })
}

export const useAdminSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.adminSettings,
    queryFn: api.fetchAdminSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes for settings
  })
}

export const useResume = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.resume(id),
    queryFn: () => api.fetchResume(id),
    enabled: !!id,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.users, data)
      toast.success("User updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user")
    },
  })
}

export const useUpdateBillingPlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateBillingPlan,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(QUERY_KEYS.billingPlan(variables.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingPlans })
      toast.success("Billing plan updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update billing plan")
    },
  })
}

export const useDeleteBillingPlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteBillingPlan,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.billingPlan(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingPlans })
      toast.success("Billing plan deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete billing plan")
    },
  })
}

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateAdminSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.adminSettings, data)
      toast.success("Settings updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings")
    },
  })
}
