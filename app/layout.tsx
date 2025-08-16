import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const metadata: Metadata = {
  title: {
    default: "CV Analyzer - AI-Powered Resume Analysis",
    template: "%s | CV Analyzer",
  },
  description:
    "Upload your resume and get AI-powered analysis, structured data extraction, and professional insights. Improve your career prospects with detailed resume feedback.",
  keywords: ["resume analysis", "CV analyzer", "AI resume", "job search", "career development", "resume feedback"],
  authors: [{ name: "CV Analyzer Team" }],
  creator: "CV Analyzer",
  publisher: "CV Analyzer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cv-analyzer.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CV Analyzer - AI-Powered Resume Analysis",
    description:
      "Upload your resume and get AI-powered analysis, structured data extraction, and professional insights.",
    siteName: "CV Analyzer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CV Analyzer - AI-Powered Resume Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Analyzer - AI-Powered Resume Analysis",
    description:
      "Upload your resume and get AI-powered analysis, structured data extraction, and professional insights.",
    images: ["/og-image.png"],
    creator: "@cvanalyzer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased scrollbar-hide`}>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
          </AuthProvider>
          <Toaster position="top-right" richColors />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
