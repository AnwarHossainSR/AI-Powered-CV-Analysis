"use client";

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { CheckCircle, CreditCard, Loader2, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface PricingPageProps {
  userCredits?: number;
  currentPlan?: string;
  isAuthenticated?: boolean;
}

export default function PricingPage({
  userCredits = 0,
  currentPlan = "free",
  isAuthenticated = false,
}: PricingPageProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (
    type: "subscription" | "credits",
    id: string
  ) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      return;
    }

    setLoading(id);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          [type === "subscription" ? "planId" : "packageId"]: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: any, type: "subscription" | "credits") => {
    if (!isAuthenticated) return "Sign In to Continue";
    if (type === "subscription" && currentPlan === plan.id)
      return "Current Plan";
    if (loading === plan.id) return "Loading...";
    return type === "subscription" ? "Choose Plan" : "Buy Credits";
  };

  const isButtonDisabled = (plan: any, type: "subscription" | "credits") => {
    return (
      loading === plan.id ||
      (type === "subscription" && currentPlan === plan.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core
            AI-powered resume analysis features.
          </p>

          {isAuthenticated && (
            <div className="mt-6 inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Current credits: {userCredits}
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="subscriptions" className="mt-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="subscriptions">Monthly Plans</TabsTrigger>
            <TabsTrigger value="credits">Buy Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="mt-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {currentPlan === plan.id && (
                    <div className="absolute -top-4 right-4">
                      <Badge variant="secondary">Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600">
                        {plan.price > 0 ? `/${plan.interval}` : "/forever"}
                      </span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-semibold">
                        {plan.credits} credits
                        {plan.price > 0 ? " per month" : ""}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        What's included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Limitations:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation) => (
                            <li key={limitation} className="flex items-start">
                              <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-500">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4">
                      {plan.id === "free" ? (
                        <Link
                          href={
                            isAuthenticated ? "/dashboard" : "/auth/sign-up"
                          }
                        >
                          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                            {isAuthenticated
                              ? "Go to Dashboard"
                              : "Get Started Free"}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() =>
                            handleCheckout("subscription", plan.id)
                          }
                          disabled={isButtonDisabled(plan, "subscription")}
                          className={`w-full ${
                            plan.popular
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {loading === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          {getButtonText(plan, "subscription")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="credits" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Buy Credits</h2>
              <p className="text-gray-600 mt-2">
                Need more credits? Purchase additional credits that never
                expire.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="relative">
                  {pkg.savings && (
                    <div className="absolute -top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {pkg.savings}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mb-2">
                      <Zap className="h-8 w-8 mx-auto text-yellow-500" />
                    </div>
                    <CardTitle className="text-xl">
                      {pkg.credits} Credits
                    </CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      ${pkg.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${(pkg.price / pkg.credits).toFixed(3)} per credit
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {pkg.credits} resume analyses
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Credits never expire
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Use anytime
                      </li>
                    </ul>

                    <Button
                      onClick={() => handleCheckout("credits", pkg.id)}
                      disabled={isButtonDisabled(pkg, "credits")}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {loading === pkg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {getButtonText(pkg, "credits")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">
                  How do credits work?
                </h3>
                <p className="mt-2 text-gray-600">
                  Each resume analysis uses 1 credit. Subscription credits reset
                  monthly, while purchased credits never expire and can be used
                  anytime.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">
                  Can I cancel anytime?
                </h3>
                <p className="mt-2 text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll
                  continue to have access until the end of your billing period.
                  Purchased credits remain available even after cancellation.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibent text-gray-900">
                  What file formats do you support?
                </h3>
                <p className="mt-2 text-gray-600">
                  We support PDF, Word (.doc, .docx), and plain text files. All
                  plans support the same file formats.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">
                  Do purchased credits expire?
                </h3>
                <p className="mt-2 text-gray-600">
                  No, credits you purchase never expire. Only monthly
                  subscription credits reset each month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
