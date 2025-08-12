"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CV Analyzer</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className={`text-gray-600 hover:text-gray-900 ${pathname === "/features" ? "text-blue-600 font-medium" : ""}`}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-gray-600 hover:text-gray-900 ${pathname === "/pricing" ? "text-blue-600 font-medium" : ""}`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`text-gray-600 hover:text-gray-900 ${pathname === "/about" ? "text-blue-600 font-medium" : ""}`}
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
