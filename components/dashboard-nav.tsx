"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileText,
  History,
  LogOut,
  Menu,
  Settings,
  Shield,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardNavProps {
  user: {
    email?: string;
    full_name?: string;
  };
  credits: number;
}

export default function DashboardNav({ user, credits }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check");
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  // Auto-expand admin menu if on admin route
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setAdminMenuOpen(true);
    }
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FileText },
    { name: "Upload Resume", href: "/dashboard/upload", icon: Upload },
    { name: "Resume History", href: "/dashboard/resumes", icon: History },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Resumes", href: "/admin/resumes", icon: FileText },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    {
      name: "Billing Management",
      href: "/admin/billing-management",
      icon: DollarSign,
    },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 pt-5 pb-4 overflow-y-auto scrollbar-hide">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <FileText className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-white font-heading">
              CV Analyzer
            </span>
          </div>

          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-3 space-y-1">
              {/* Regular Navigation */}
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-slate-700/50 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive
                          ? "text-blue-100"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}

              {/* Admin Section */}
              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-slate-700">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-purple-300 hover:bg-slate-700/50 hover:text-purple-200 transition-all duration-200"
                  >
                    <Shield className="mr-3 flex-shrink-0 h-5 w-5 text-purple-400 transition-transform duration-200" />
                    Admin Panel
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                        adminMenuOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      adminMenuOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-2 space-y-1 pl-4">
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-slate-700/50 text-white shadow-lg shadow-purple-500/25"
                                : "text-slate-300 hover:bg-slate-700/50 hover:text-purple-200"
                            }`}
                          >
                            <item.icon
                              className={`mr-3 flex-shrink-0 h-4 w-4 transition-colors duration-200 ${
                                isActive
                                  ? "text-purple-100"
                                  : "text-slate-400 group-hover:text-purple-300"
                              }`}
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            <div className="flex-shrink-0 px-4 py-4 border-t border-slate-700">
              {/* Credits Display */}
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-blue-500/20">
                <div className="text-sm font-medium text-blue-200">
                  Credits Remaining
                </div>
                <div className="text-2xl font-bold text-blue-100 mt-1">
                  {credits}
                </div>
              </div>

              {/* Admin Badge */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-3 mb-4 border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-200 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-purple-300" />
                    Admin Access
                  </div>
                </div>
              )}

              {/* User Info */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Sign Out */}
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 font-heading">
              CV Analyzer
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-blue-400" />
                    <span className="ml-2 text-lg font-bold text-white">
                      CV Analyzer
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                  <nav className="space-y-2">
                    {/* Regular Navigation */}
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                              : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          }`}
                        >
                          <item.icon
                            className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                              isActive
                                ? "text-blue-100"
                                : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />
                          {item.name}
                        </Link>
                      );
                    })}

                    {/* Admin Section */}
                    {isAdmin && (
                      <div className="pt-4 mt-4 border-t border-slate-700">
                        <button
                          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                          className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-purple-300 hover:bg-slate-700/50 hover:text-purple-200 transition-all duration-200"
                        >
                          <Shield className="mr-3 flex-shrink-0 h-5 w-5 text-purple-400" />
                          Admin Panel
                          <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                              adminMenuOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            adminMenuOpen
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="mt-2 space-y-1 pl-4">
                            {adminNavigation.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                                      : "text-slate-300 hover:bg-slate-700/50 hover:text-purple-200"
                                  }`}
                                >
                                  <item.icon
                                    className={`mr-3 flex-shrink-0 h-4 w-4 transition-colors duration-200 ${
                                      isActive
                                        ? "text-purple-100"
                                        : "text-slate-400 group-hover:text-purple-300"
                                    }`}
                                  />
                                  {item.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </nav>
                </div>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  {/* Credits */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-3 mb-3 border border-blue-500/20">
                    <div className="text-sm font-medium text-blue-200">
                      Credits: {credits}
                    </div>
                  </div>

                  {/* Admin Badge */}
                  {isAdmin && (
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-3 mb-3 border border-purple-500/20">
                      <div className="text-sm font-medium text-purple-200 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Access
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <form action={signOut}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu push content down */}
      <div className="lg:pl-64">{/* Your main content goes here */}</div>
    </>
  );
}
