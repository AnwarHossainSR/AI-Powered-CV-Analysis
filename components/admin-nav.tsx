"use client"

import { Button } from "@/components/ui/button"
import { Shield, Users, FileText, CreditCard, Settings, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/actions"

interface AdminNavProps {
  user: {
    email: string
    full_name?: string
  }
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Resumes", href: "/admin/resumes", icon: FileText },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex h-16 items-center justify-between bg-gray-900 px-4 text-white">
      <div className="flex items-center">
        <Shield className="h-8 w-8 text-blue-400" />
        <span className="ml-2 text-xl font-bold">Admin Panel</span>
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div className="font-medium">{user.full_name || user.email}</div>
          <div className="text-gray-400">Administrator</div>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
