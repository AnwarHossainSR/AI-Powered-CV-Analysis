"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions"
import {
  CreditCard,
  FileText,
  History,
  LogOut,
  Menu,
  Settings,
  Shield,
  Upload,
  User,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface DashboardNavProps {
  user: {
    email?: string
    full_name?: string
  }
  credits: number
}

export default function DashboardNav({ user, credits }: DashboardNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check")
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    checkAdminStatus()
  }, [])

  // Auto-expand admin menu if on admin route
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setAdminMenuOpen(true)
    }
  }, [pathname])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FileText },
    { name: "Upload Resume", href: "/dashboard/upload", icon: Upload },
    { name: "Resume History", href: "/dashboard/resumes", icon: History },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ]

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Resumes", href: "/admin/resumes", icon: FileText },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 font-heading">CV Analyzer</span>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {/* Regular Navigation */}
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}

              {/* Admin Section */}
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-purple-600 hover:bg-purple-50 hover:text-purple-900"
                  >
                    <Shield className="mr-3 flex-shrink-0 h-6 w-6 text-purple-500" />
                    Admin Panel
                    {adminMenuOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </button>

                  {adminMenuOpen && (
                    <div className="mt-1 space-y-1">
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center pl-8 pr-2 py-2 text-sm font-medium rounded-md ${
                              isActive
                                ? "bg-purple-100 text-purple-900"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-900"
                            }`}
                          >
                            <item.icon
                              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                isActive ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"
                              }`}
                            />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-blue-900">Credits Remaining</div>
                <div className="text-2xl font-bold text-blue-600">{credits}</div>
              </div>

              {isAdmin && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-purple-900 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin Access
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <form action={signOut} className="mt-3">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 font-heading">CV Analyzer</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <nav className="px-2 py-3 space-y-1">
              {/* Regular Navigation */}
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}

              {/* Admin Section */}
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-purple-600 hover:bg-purple-50 hover:text-purple-900"
                  >
                    <Shield className="mr-3 flex-shrink-0 h-6 w-6 text-purple-500" />
                    Admin Panel
                    {adminMenuOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </button>

                  {adminMenuOpen && (
                    <div className="mt-1 space-y-1">
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center pl-8 pr-2 py-2 text-sm font-medium rounded-md ${
                              isActive
                                ? "bg-purple-100 text-purple-900"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-900"
                            }`}
                          >
                            <item.icon
                              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                isActive ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"
                              }`}
                            />
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-blue-900">Credits: {credits}</div>
              </div>
              {isAdmin && (
                <div className="bg-purple-50 rounded-lg p-3 mb-3">
                  <div className="text-sm font-medium text-purple-900 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin Access
                  </div>
                </div>
              )}
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
