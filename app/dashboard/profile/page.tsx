import DashboardNav from "@/components/dashboard-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { User, Settings, Shield, Download, Trash2, Key, BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-12">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 font-heading">Your Profile</h1>
                  <p className="text-xl text-gray-600 mt-2">Manage your personal information and settings</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Account Information */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full -mr-20 -mt-20"></div>
                <CardHeader className="pb-8 relative">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center">
                    <Settings className="w-6 h-6 mr-3 text-blue-600" />
                    Account Information
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Your basic account details and subscription status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        defaultValue={profile.full_name || ""}
                        className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user.email || ""}
                        disabled
                        className="h-12 text-lg bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Subscription Status</h4>
                        <div className="mt-2">
                          <Badge
                            variant={profile.subscription_status === "free" ? "secondary" : "default"}
                            className={`text-base px-4 py-2 ${
                              profile.subscription_status === "free"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            }`}
                          >
                            {profile.subscription_status === "free"
                              ? "Free Plan"
                              : `${profile.subscription_status} Plan`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg px-8 py-3 text-lg">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Credits & Usage */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-100/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="pb-8 relative">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-cyan-600" />
                    Credits & Usage
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Monitor your credit balance and usage history
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg">
                      <div className="text-4xl font-bold text-cyan-600 mb-2">{profile.credits}</div>
                      <div className="text-lg font-medium text-gray-700">Credits Remaining</div>
                    </div>
                    <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">0</div>
                      <div className="text-lg font-medium text-gray-700">This Month</div>
                    </div>
                    <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg">
                      <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
                      <div className="text-lg font-medium text-gray-700">Total Used</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-gray-600" />
                    Account Actions
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Manage your account settings and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Key className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Change Password</h4>
                        <p className="text-gray-600">Update your account password for better security</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-300 px-6 py-3 bg-transparent"
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Export Data</h4>
                        <p className="text-gray-600">Download all your resume analysis data and history</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="hover:bg-emerald-50 hover:border-emerald-300 px-6 py-3 bg-transparent"
                    >
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-6 border border-red-100 rounded-2xl hover:shadow-lg hover:border-red-200 transition-all duration-300 bg-red-50/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-red-900">Delete Account</h4>
                        <p className="text-red-600">Permanently delete your account and all associated data</p>
                      </div>
                    </div>
                    <Button variant="destructive" className="px-6 py-3">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
