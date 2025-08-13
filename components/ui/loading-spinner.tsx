"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-cyan-600", sizeClasses[size])} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-600 rounded-full animate-spin mx-auto"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900 font-heading">Loading...</h3>
        <p className="mt-2 text-sm text-gray-600">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-32 w-full"></div>
      <div className="mt-4 space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        <div className="bg-gray-200 rounded h-4 w-1/2"></div>
      </div>
    </div>
  )
}
