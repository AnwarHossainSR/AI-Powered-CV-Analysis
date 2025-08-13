import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const supabase = createClient()

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
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">Profile Settings</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your account information and preferences.</p>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Account Information</CardTitle>
                  <CardDescription>Your basic account details and subscription status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        defaultValue={profile.full_name || ""}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user.email || ""}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Subscription Status</h4>
                      <div className="mt-1">
                        <Badge
                          variant={profile.subscription_status === "free" ? "secondary" : "default"}
                          className="capitalize"
                        >
                          {profile.subscription_status}
                        </Badge>
                      </div>
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Credits & Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Credits & Usage</CardTitle>
                  <CardDescription>Monitor your credit balance and usage history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{profile.credits}</div>
                      <div className="text-sm text-gray-600">Credits Remaining</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">Total Used</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Account Actions</CardTitle>
                  <CardDescription>Manage your account settings and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                      <p className="text-sm text-gray-600">Download all your resume analysis data</p>
                    </div>
                    <Button variant="outline">Export Data</Button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
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
