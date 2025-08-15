import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/ui/loading-screen"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "CV Analyzer - AI-Powered Resume Analysis",
  description: "Upload your resume and get AI-powered analysis, structured data extraction, and professional insights.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased scrollbar-hide`}>
      <body>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
