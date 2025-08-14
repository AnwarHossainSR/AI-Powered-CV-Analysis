import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval_type: string
  credits: number
  features: string[]
  stripe_price_id: string
  is_active: boolean
  sort_order: number
}

export default async function PricingPage() {
  const supabase = createClient()

  const { data: plans, error } = await supabase
    .from("billing_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching billing plans:", error)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price)
  }

  const getPeriodDisplay = (intervalType: string) => {
    switch (intervalType) {
      case "monthly":
        return "month"
      case "yearly":
        return "year"
      case "one_time":
        return "one-time"
      default:
        return intervalType
    }
  }

  const getCreditsDisplay = (credits: number) => {
    if (credits === -1) return "Unlimited credits"
    return `${credits.toLocaleString()} credits`
  }

  const popularPlanIndex = Math.floor((plans?.length || 0) / 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl font-heading">Simple, transparent pricing</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core AI-powered resume analysis features.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans?.map((plan: BillingPlan, index: number) => (
            <Card key={plan.id} className={`relative ${index === popularPlanIndex ? "ring-2 ring-blue-600" : ""}`}>
              {index === popularPlanIndex && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-heading">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price, plan.currency)}</span>
                  {plan.interval_type !== "one_time" && (
                    <span className="text-gray-600">/{getPeriodDisplay(plan.interval_type)}</span>
                  )}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-semibold">{getCreditsDisplay(plan.credits)}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features?.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/auth/sign-up">
                    <Button
                      className={`w-full ${
                        index === popularPlanIndex
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ... existing FAQ section ... */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Frequently Asked Questions</h2>
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">How do credits work?</h3>
                <p className="mt-2 text-gray-600">
                  Each resume analysis uses 1 credit. Credits reset monthly with your subscription, and unused credits
                  don't roll over.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">Can I cancel anytime?</h3>
                <p className="mt-2 text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of
                  your billing period.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900">What file formats do you support?</h3>
                <p className="mt-2 text-gray-600">
                  We support PDF, Word (.doc, .docx), and plain text files. Premium plans also support additional
                  formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
