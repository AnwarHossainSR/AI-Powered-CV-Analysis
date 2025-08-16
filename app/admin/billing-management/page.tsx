import { DatabasePlansTab } from "@/components/admin/database-plans-tab";
import { StripePlansTab } from "@/components/admin/stripe-plans-tab";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Package, TrendingUp, Users } from "lucide-react";

export default function BillingManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Billing Management
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Manage Stripe products and database billing plans with automatic
                synchronization
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">12</div>
                <div className="text-xs text-blue-600 font-medium">
                  Products
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">8</div>
                <div className="text-xs text-green-600 font-medium">Active</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">24%</div>
                <div className="text-xs text-purple-600 font-medium">
                  Growth
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">156</div>
                <div className="text-xs text-orange-600 font-medium">
                  Subscribers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="database" className="w-full">
            {/* Custom Tab Header */}
            <div className="border-b border-gray-200 bg-gray-50/50 px-8 py-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-gray-200 shadow-sm">
                <TabsTrigger
                  value="database"
                  className="data-[state=active]:bg-black data-[state=active]:hover:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium cursor-pointer"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Database Plans
                </TabsTrigger>
                <TabsTrigger
                  value="stripe"
                  className="data-[state=active]:bg-black data-[state=active]:hover:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe Products
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <TabsContent value="database" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Database Plans
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Manage billing plans stored in your database
                      </p>
                    </div>
                  </div>
                  <DatabasePlansTab />
                </div>
              </TabsContent>

              <TabsContent value="stripe" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Stripe Products
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Manage Stripe products with automatic database sync
                      </p>
                    </div>
                  </div>
                  <StripePlansTab />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Info */}
        <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">Sync Status</h3>
                <p className="text-sm text-gray-600">
                  Last synchronized with Stripe:{" "}
                  <span className="font-medium text-green-600">
                    2 minutes ago
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All systems operational
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
