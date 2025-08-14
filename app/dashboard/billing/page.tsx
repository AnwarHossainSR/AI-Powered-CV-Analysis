import CreditPurchase from "@/components/credit-purchase";
import DashboardNav from "@/components/dashboard-nav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getBillingPlans,
  getUserCreditTransactions,
  getUserProfile,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Gift,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

interface BillingPageProps {
  searchParams: {
    success?: string;
    canceled?: string;
  };
}

// Helper functions for dynamic content
const getPlanColor = (planName: string) => {
  const name = planName?.toLowerCase();
  if (name?.includes("free")) return "from-gray-500 to-gray-600";
  if (name?.includes("basic")) return "from-blue-500 to-blue-600";
  if (name?.includes("pro")) return "from-purple-600 to-cyan-600";
  if (name?.includes("premium") || name?.includes("plus"))
    return "from-amber-500 to-orange-600";
  if (name?.includes("enterprise") || name?.includes("business"))
    return "from-gray-800 to-gray-900";
  if (name?.includes("starter")) return "from-emerald-500 to-teal-600";
  // Default gradient based on hash of plan name for consistency
  const hash =
    planName?.split("").reduce((a, b) => a + b.charCodeAt(0), 0) || 0;
  const gradients = [
    "from-rose-500 to-pink-600",
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-cyan-500 to-blue-600",
    "from-teal-500 to-emerald-600",
    "from-green-500 to-teal-600",
  ];
  return gradients[hash % gradients.length];
};

const getPlanBadgeStyle = (planName: string) => {
  const name = planName?.toLowerCase();
  if (name?.includes("free")) return "bg-gray-100 text-gray-800";
  if (name?.includes("basic"))
    return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
  if (name?.includes("pro"))
    return "bg-gradient-to-r from-purple-600 to-cyan-600 text-white";
  if (name?.includes("premium") || name?.includes("plus"))
    return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
  if (name?.includes("enterprise") || name?.includes("business"))
    return "bg-gradient-to-r from-gray-800 to-gray-900 text-white";
  if (name?.includes("starter"))
    return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white";
  // Default for unknown plan types
  return "bg-gradient-to-r from-indigo-500 to-purple-600 text-white";
};

const getCreditUsageStats = (transactions: any[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentTransactions =
    transactions?.filter((t) => new Date(t.created_at) >= thirtyDaysAgo) || [];

  const creditsUsed = recentTransactions
    .filter((t) => t.type === "usage")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const creditsPurchased = recentTransactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    used: creditsUsed,
    purchased: creditsPurchased,
    totalTransactions: recentTransactions.length,
  };
};

const getNextBillingDate = (subscriptionStatus: string) => {
  if (subscriptionStatus === "free") return null;

  // This would typically come from your subscription data
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100); // assuming amount is in cents
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = await createClient();

  // Get user (middleware ensures user exists)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getUserProfile(user!.id);
  const transactions = await getUserCreditTransactions(user!.id);
  const plans = await getBillingPlans();

  // Explicitly access searchParams properties
  const { success, canceled } = await searchParams;

  // Dynamic calculations
  const creditStats = getCreditUsageStats(transactions || []);
  const nextBillingDate = getNextBillingDate(
    profile?.subscription_status || "free"
  );
  const currentPlan = plans?.find(
    (p: any) =>
      p.name.toLowerCase() === profile?.subscription_status?.toLowerCase()
  );
  const creditUsagePercentage = currentPlan
    ? Math.min(
        (creditStats.used /
          (currentPlan.credits === -1 ? 1000 : currentPlan.credits)) *
          100,
        100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <DashboardNav user={user!} credits={profile?.credits || 0} />

      <div className="lg:pl-64">
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Animated Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg animate-pulse">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-heading">
                    Manage Your Subscription
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {profile?.subscription_status === "free"
                      ? "Unlock your potential with a premium plan"
                      : "Your premium experience is active"}
                  </p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 shadow-md animate-in slide-in-from-top duration-500">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800 text-base">
                  🎉 Payment successful! Your credits have been added to your
                  account.
                </AlertDescription>
              </Alert>
            )}

            {canceled && (
              <Alert className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md animate-in slide-in-from-top duration-500">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-base">
                  Payment was canceled. You can try again anytime.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              {/* Enhanced Current Plan Card */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-white to-purple-50/30 overflow-hidden relative group hover:shadow-3xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/40 to-cyan-100/40 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-100/30 to-purple-100/30 rounded-full -ml-16 -mb-16 group-hover:scale-110 transition-transform duration-700"></div>

                <CardHeader className="pb-6 relative z-10">
                  <CardTitle className="text-2xl font-heading text-gray-900 flex items-center mb-2">
                    <Zap className="w-6 h-6 mr-3 text-purple-600" />
                    Current Plan Overview
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Your active subscription and usage analytics
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  {/* Plan Status */}
                  <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${getPlanColor(
                          profile?.subscription_status || "free"
                        )} rounded-2xl flex items-center justify-center shadow-xl`}
                      >
                        <Crown className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center mb-3">
                          <Badge
                            className={`text-base px-4 py-2 mr-4 font-semibold shadow-md ${getPlanBadgeStyle(
                              profile?.subscription_status || "free"
                            )}`}
                          >
                            {profile?.subscription_status === "free"
                              ? "Free Plan"
                              : `${profile?.subscription_status?.toUpperCase()} Plan`}
                          </Badge>
                          {profile?.subscription_status !== "free" && (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-200 bg-emerald-50"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                              {profile?.credits || 0}
                            </span>
                            <span className="text-lg text-gray-600 font-medium">
                              credits remaining
                            </span>
                          </div>
                          {currentPlan && currentPlan.credits !== -1 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Credit Usage This Month</span>
                                <span>
                                  {creditStats.used} / {currentPlan.credits}
                                </span>
                              </div>
                              <Progress
                                value={creditUsagePercentage}
                                className="h-2 bg-gray-100"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {nextBillingDate && (
                      <div className="text-right">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">Next Billing</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {nextBillingDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Usage Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-600 text-sm font-medium">
                            Credits Purchased
                          </p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {creditStats.purchased}
                          </p>
                        </div>
                        <ArrowUp className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-600 text-sm font-medium">
                            Credits Used
                          </p>
                          <p className="text-2xl font-bold text-red-700">
                            {creditStats.used}
                          </p>
                        </div>
                        <ArrowDown className="w-6 h-6 text-red-500" />
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cyan-600 text-sm font-medium">
                            Total Transactions
                          </p>
                          <p className="text-2xl font-bold text-cyan-700">
                            {creditStats.totalTransactions}
                          </p>
                        </div>
                        <Activity className="w-6 h-6 text-cyan-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {profile?.subscription_status === "free" && (
                <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">
                          Unlock Premium Features
                        </h3>
                        <p className="text-purple-100">
                          Get unlimited access to advanced AI analysis
                        </p>
                        <div className="flex items-center space-x-4 mt-4">
                          <Gift className="w-5 h-5" />
                          <span>Special launch pricing available</span>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-gray-50 font-semibold px-8"
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dynamic Subscription Plans */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                    {profile?.subscription_status === "free"
                      ? "Choose Your Plan"
                      : "Change Your Plan"}
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {profile?.subscription_status === "free"
                      ? "Select the perfect plan to accelerate your career growth"
                      : "Upgrade or modify your current subscription"}
                  </p>
                </div>

                {/* Compact Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {plans
                    ?.filter((plan: any) => plan.is_active)
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((plan: any, index: number) => {
                      const isCurrentPlan =
                        plan.name.toLowerCase() ===
                        profile?.subscription_status?.toLowerCase();
                      const isPopular =
                        plan.interval_type === "monthly" &&
                        plan.price > 0 &&
                        !isCurrentPlan;

                      return (
                        <Card
                          key={plan.id}
                          className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br ${
                            isCurrentPlan
                              ? "from-purple-50 to-cyan-50 ring-2 ring-purple-200 shadow-purple-100"
                              : isPopular
                              ? "from-white to-purple-50/30 ring-2 ring-purple-300 shadow-purple-200"
                              : "from-white to-gray-50/30"
                          }`}
                        >
                          {/* Popular Badge */}
                          {isPopular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                              <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                                Most Popular
                              </Badge>
                            </div>
                          )}

                          {/* Current Plan Badge */}
                          {isCurrentPlan && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                                Current Plan
                              </Badge>
                            </div>
                          )}

                          <CardContent className="p-6">
                            {/* Plan Header */}
                            <div className="text-center mb-6">
                              <div
                                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getPlanColor(
                                  plan.name
                                )} shadow-lg`}
                              >
                                {plan.name.toLowerCase() === "free" ? (
                                  <Gift className="w-8 h-8 text-white" />
                                ) : plan.name.toLowerCase() === "pro" ? (
                                  <Zap className="w-8 h-8 text-white" />
                                ) : plan.name.toLowerCase() === "premium" ? (
                                  <Crown className="w-8 h-8 text-white" />
                                ) : (
                                  <Target className="w-8 h-8 text-white" />
                                )}
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 font-heading mb-2">
                                {plan.name}
                              </h3>

                              <div className="mb-3">
                                <span className="text-3xl font-bold text-gray-900">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency:
                                      plan.currency?.toUpperCase() || "USD",
                                  }).format(plan.price)}
                                </span>
                                {plan.interval_type !== "one_time" && (
                                  <span className="text-gray-500 text-sm">
                                    /
                                    {plan.interval_type === "monthly"
                                      ? "month"
                                      : plan.interval_type === "yearly"
                                      ? "year"
                                      : plan.interval_type}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm mb-4">
                                {plan.description}
                              </p>

                              {/* Credits Display */}
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl mb-4">
                                <span className="text-blue-700 font-semibold text-sm">
                                  {plan.credits === -1
                                    ? "Unlimited Credits"
                                    : `${plan.credits.toLocaleString()} Credits`}
                                </span>
                              </div>
                            </div>

                            {/* Compact Features List */}
                            <div className="mb-6">
                              <ul className="space-y-2">
                                {plan.features
                                  ?.slice(0, 4)
                                  .map(
                                    (feature: string, featureIndex: number) => (
                                      <li
                                        key={featureIndex}
                                        className="flex items-start text-sm"
                                      >
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600 leading-relaxed">
                                          {feature}
                                        </span>
                                      </li>
                                    )
                                  )}
                                {plan.features?.length > 4 && (
                                  <li className="text-xs text-gray-500 pl-6">
                                    +{plan.features.length - 4} more features
                                  </li>
                                )}
                              </ul>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4">
                              {isCurrentPlan ? (
                                <Button
                                  disabled
                                  className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                                >
                                  Current Plan
                                </Button>
                              ) : (
                                <Button
                                  className={`w-full transition-all duration-300 ${
                                    isPopular
                                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl"
                                      : "bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg"
                                  }`}
                                >
                                  {profile?.subscription_status === "free"
                                    ? "Get Started"
                                    : "Switch Plan"}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {/* Plan Comparison Link */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-gray-50"
                  >
                    Compare All Features
                  </Button>
                </div>
              </div>

              {/* Credit Purchase */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                    Need More Credits?
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Purchase additional credits anytime to keep analyzing
                    resumes
                  </p>
                </div>
                <CreditPurchase currentCredits={profile?.credits || 0} />
              </div>

              {/* Enhanced Transaction History */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-8 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-6 h-6 mr-3 text-cyan-600" />
                      <div>
                        <CardTitle className="text-2xl font-heading text-gray-900">
                          Transaction History
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600 mt-1">
                          Track your credit purchases and usage over time
                        </CardDescription>
                      </div>
                    </div>
                    {transactions && transactions.length > 10 && (
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {transactions && transactions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {transactions
                        .slice(0, 10)
                        .map((transaction: any, index: number) => (
                          <div
                            key={transaction.id}
                            className={`flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-300 ${
                              index === 0
                                ? "bg-gradient-to-r from-blue-50/30 to-transparent"
                                : ""
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                                  transaction.type === "purchase"
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                    : transaction.type === "usage"
                                    ? "bg-gradient-to-br from-red-500 to-red-600"
                                    : "bg-gradient-to-br from-cyan-500 to-cyan-600"
                                }`}
                              >
                                {transaction.type === "purchase" ? (
                                  <ArrowUp className="w-5 h-5 text-white" />
                                ) : transaction.type === "usage" ? (
                                  <ArrowDown className="w-5 h-5 text-white" />
                                ) : (
                                  <Activity className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900">
                                  {transaction.description ||
                                    `${
                                      transaction.type.charAt(0).toUpperCase() +
                                      transaction.type.slice(1)
                                    } Transaction`}
                                </p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <p className="text-sm text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(
                                      transaction.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                  {transaction.amount_usd && (
                                    <p className="text-sm text-gray-500 flex items-center">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {formatCurrency(transaction.amount_usd)}
                                    </p>
                                  )}
                                </div>
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
                                {transaction.type === "purchase"
                                  ? "+"
                                  : transaction.type === "usage"
                                  ? "-"
                                  : ""}
                                {Math.abs(transaction.amount)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                credits
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CreditCard className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 font-heading mb-3">
                        No transactions yet
                      </h3>
                      <p className="text-lg text-gray-500 max-w-md mx-auto mb-6">
                        Your transaction history will appear here once you make
                        your first purchase.
                      </p>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
