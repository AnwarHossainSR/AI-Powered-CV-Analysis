import CreditPurchase from "@/components/credit-purchase"
import DashboardNav from "@/components/dashboard-nav"
import SubscriptionPlans from "@/components/subscription-plans"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { AlertCircle, CheckCircle, CreditCard, Crown, Zap, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"

interface BillingPageProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
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

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Explicitly access searchParams properties
  const { success, canceled } = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-12">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 font-heading">Manage Your Subscription</h1>
                  <p className="text-xl text-gray-600 mt-2">Choose a plan that suits your career needs</p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 shadow-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <AlertDescription className="text-emerald-800 text-lg">
                  🎉 Payment successful! Your credits have been added to your account.
                </AlertDescription>
              </Alert>
            )}

            {canceled && (
              <Alert className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800 text-lg">
                  Payment was canceled. You can try again anytime.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-12">
              {/* Current Plan */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100/30 rounded-full -mr-20 -mt-20"></div>
                <CardHeader className="pb-8 relative">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center">
                    <Zap className="w-6 h-6 mr-3 text-purple-600" />
                    Current Plan
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Your current subscription and credit balance
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                        <Crown className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center mb-3">
                          <Badge
                            variant={profile.subscription_status === "free" ? "secondary" : "default"}
                            className={`text-lg px-4 py-2 mr-4 ${
                              profile.subscription_status === "free"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                            }`}
                          >
                            {profile.subscription_status === "free"
                              ? "Free Plan"
                              : `${profile.subscription_status} Plan`}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-3xl font-bold text-purple-600">{profile.credits}</span>
                          <span className="text-lg text-gray-600">credits remaining</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Plans */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-heading mb-8 text-center">Upgrade Your Plan</h2>
                <SubscriptionPlans currentPlan={profile.subscription_status} subscriptionId={profile.subscription_id} />
              </div>

              {/* Credit Purchase */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-heading mb-8 text-center">
                  Purchase Additional Credits
                </h2>
                <CreditPurchase currentCredits={profile.credits} />
              </div>

              {/* Transaction History */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-cyan-600" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Your recent credit purchases and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction: any) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-cyan-200 transition-all duration-300 bg-gradient-to-r from-white to-gray-50/30"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                                transaction.type === "purchase"
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                  : transaction.type === "usage"
                                    ? "bg-gradient-to-br from-red-500 to-red-600"
                                    : "bg-gradient-to-br from-cyan-500 to-cyan-600"
                              }`}
                            >
                              <span className="text-white font-bold text-lg">
                                {transaction.type === "purchase" ? "+" : transaction.type === "usage" ? "-" : "•"}
                              </span>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {transaction.description || `${transaction.type} transaction`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${
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
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <CreditCard className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 font-heading mb-4">No transactions yet</h3>
                      <p className="text-lg text-gray-500 max-w-md mx-auto">
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
