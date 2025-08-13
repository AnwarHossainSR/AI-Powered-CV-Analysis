import AdminNav from "@/components/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { checkAdminAccess } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { Database, Key, Mail, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />

      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              System Settings
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure system settings and integrations.
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current system health and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Badge className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">Database</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      AI Processing
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Badge className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">Stripe</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Manage API keys and external integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Gemini API
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        disabled
                      />
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe API
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        disabled
                      />
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Configure email notifications and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <Input type="email" placeholder="noreply@cvanalyzer.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <Input type="email" placeholder="support@cvanalyzer.com" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-600">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Users
                </CardTitle>
                <CardDescription>Manage administrator access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Super Administrator
                      </p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline">Add Admin User</Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Changes */}
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
