import CreditPurchase from "@/components/credit-purchase"
import DashboardNav from "@/components/dashboard-nav"
import SubscriptionPlans from "@/components/subscription-plans"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { AlertCircle, CheckCircle, CreditCard, Crown, Zap, TrendingUp } from "lucide-react"
import { getUserProfile, getUserCreditTransactions } from "@/lib/queries"

interface BillingPageProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = await createClient()

  // Get user (middleware ensures user exists)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = await getUserProfile(user!.id)
  const transactions = await getUserCreditTransactions(user!.id)

  // Explicitly access searchParams properties
  const { success, canceled } = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <DashboardNav user={user!} credits={profile?.credits || 0} />

      <div className="lg:pl-64">
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-heading">Manage Your Subscription</h1>
                  <p className="text-base text-gray-600 mt-1">Choose a plan that suits your career needs</p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 shadow-md">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800 text-base">
                  🎉 Payment successful! Your credits have been added to your account.
                </AlertDescription>
              </Alert>
            )}

            {canceled && (
              <Alert className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-base">
                  Payment was canceled. You can try again anytime.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              {/* Current Plan */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="pb-6 relative">
                  <CardTitle className="text-lg font-heading text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Current Plan
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Your current subscription and credit balance
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <Badge
                            variant={profile?.subscription_status === "free" ? "secondary" : "default"}
                            className={`text-sm px-3 py-1 mr-3 ${
                              profile?.subscription_status === "free"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                            }`}
                          >
                            {profile?.subscription_status === "free"
                              ? "Free Plan"
                              : `${profile?.subscription_status} Plan`}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-purple-600">{profile?.credits || 0}</span>
                          <span className="text-base text-gray-600">credits remaining</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Plans */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-heading mb-6 text-center">Upgrade Your Plan</h2>
                <SubscriptionPlans
                  currentPlan={profile?.subscription_status || "free"}
                  subscriptionId={profile?.subscription_id}
                />
              </div>

              {/* Credit Purchase */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-heading mb-6 text-center">
                  Purchase Additional Credits
                </h2>
                <CreditPurchase currentCredits={profile?.credits || 0} />
              </div>

              {/* Transaction History */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-lg font-heading text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-cyan-600" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Your recent credit purchases and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.slice(0, 10).map((transaction: any) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md hover:border-cyan-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/30"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                                transaction.type === "purchase"
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                  : transaction.type === "usage"
                                    ? "bg-gradient-to-br from-red-500 to-red-600"
                                    : "bg-gradient-to-br from-cyan-500 to-cyan-600"
                              }`}
                            >
                              <span className="text-white font-bold text-sm">
                                {transaction.type === "purchase" ? "+" : transaction.type === "usage" ? "-" : "•"}
                              </span>
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-900">
                                {transaction.description || `${transaction.type} transaction`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-base font-bold ${
                                transaction.type === "purchase"
                                  ? "text-emerald-600"
                                  : transaction.type === "usage"
                                    ? "text-red-600"
                                    : "text-gray-900"
                              }`}
                            >
                              {transaction.type === "purchase" ? "+" : transaction.type === "usage" ? "-" : ""}
                              {Math.abs(transaction.amount)} credits
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 font-heading mb-2">No transactions yet</h3>
                      <p className="text-base text-gray-500 max-w-md mx-auto">
                        Your transaction history will appear here once you make a purchase.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
