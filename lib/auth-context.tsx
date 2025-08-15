"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Check admin status
        const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single()

        setIsAdmin(adminUser?.role === "super_admin")
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("[v0] Auth refresh error:", error)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      if (mounted) {
        await refreshUser()
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted && (event === "SIGNED_IN" || event === "SIGNED_OUT")) {
        await refreshUser()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [refreshUser, supabase.auth])

  return <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
