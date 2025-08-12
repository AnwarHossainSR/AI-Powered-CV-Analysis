"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"

interface SubscriptionPlansProps {
  currentPlan: string
  subscriptionId?: string
}

export default function SubscriptionPlans({ currentPlan, subscriptionId }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "subscription",
          planId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Failed to initiate subscription. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    // In a real app, you'd create a customer portal session
    alert("Subscription management coming soon!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plans</CardTitle>
        <div className="text-sm text-gray-600">
          Current plan: <Badge className="ml-1 capitalize">{currentPlan}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id
            const isUpgrade = currentPlan === "free" || (currentPlan === "basic" && plan.id === "premium")

            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${isCurrentPlan ? "border-blue-500 bg-blue-50" : ""}`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{plan.credits} credits per month</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center">
                  {isCurrentPlan ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">Current Plan</Badge>
                      {subscriptionId && (
                        <Button variant="outline" onClick={handleManageSubscription} className="w-full bg-transparent">
                          Manage Subscription
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading === plan.id}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `${isUpgrade ? "Upgrade to" : "Switch to"} ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
