import CreditPurchase from "@/components/credit-purchase";
import DashboardNav from "@/components/dashboard-nav";
import SubscriptionPlans from "@/components/subscription-plans";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";

interface BillingPageProps {
  searchParams: {
    success?: string;
    canceled?: string;
  };
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const supabase = createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Explicitly access searchParams properties
  const { success, canceled } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} credits={profile.credits} />

      <div className="lg:pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">
                Billing & Credits
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your subscription and purchase additional credits.
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment successful! Your credits have been added to your
                  account.
                </AlertDescription>
              </Alert>
            )}

            {canceled && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Payment was canceled. You can try again anytime.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Current Plan</CardTitle>
                  <CardDescription>
                    Your current subscription and credit balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <Badge
                          variant={
                            profile.subscription_status === "free"
                              ? "secondary"
                              : "default"
                          }
                          className="capitalize mr-3"
                        >
                          {profile.subscription_status}
                        </Badge>
                        <span className="text-lg font-medium text-gray-900">
                          {profile.subscription_status === "free"
                            ? "Free Plan"
                            : `${profile.subscription_status} Plan`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold text-blue-600">
                          {profile.credits}
                        </span>{" "}
                        credits remaining
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Plans */}
              <SubscriptionPlans
                currentPlan={profile.subscription_status}
                subscriptionId={profile.subscription_id}
              />

              {/* Credit Purchase */}
              <CreditPurchase currentCredits={profile.credits} />

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    Your recent credit purchases and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction: any) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                transaction.type === "purchase"
                                  ? "bg-green-100"
                                  : transaction.type === "usage"
                                  ? "bg-red-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              <span
                                className={`text-xs font-bold ${
                                  transaction.type === "purchase"
                                    ? "text-green-600"
                                    : transaction.type === "usage"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {transaction.type === "purchase"
                                  ? "+"
                                  : transaction.type === "usage"
                                  ? "-"
                                  : "•"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.description ||
                                  `${transaction.type} transaction`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  transaction.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${
                                transaction.type === "purchase"
                                  ? "text-green-600"
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
                              {Math.abs(transaction.amount)} credits
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No transactions yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Your transaction history will appear here once you make
                        a purchase.
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
  );
}
