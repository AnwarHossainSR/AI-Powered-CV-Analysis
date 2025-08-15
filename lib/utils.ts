import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { config } from "./config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown date"

  try {
    // Parse the date string and format it safely
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Invalid date"
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown date"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid date"
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback

  try {
    return JSON.parse(jsonString) as T
  } catch {
    return fallback
  }
}

export // Internal check - not exported directly
const isSupabaseConfigured =
  typeof config.supabaseUrl === "string" &&
  config.supabaseUrl.length > 0 &&
  typeof config.supabaseAnonKey === "string" &&
  config.supabaseAnonKey.length > 0
