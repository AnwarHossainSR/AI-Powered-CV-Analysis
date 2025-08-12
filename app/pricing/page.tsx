import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our service",
      credits: "10 credits",
      features: ["10 resume analyses", "Basic AI parsing", "PDF & Word support", "Email support"],
      limitations: ["No priority support", "Basic insights only", "No bulk processing"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Basic",
      price: "$9.99",
      period: "month",
      description: "Great for job seekers and professionals",
      credits: "100 credits",
      features: [
        "100 resume analyses per month",
        "Advanced AI parsing",
        "All file formats supported",
        "Priority email support",
        "Detailed insights & recommendations",
        "Export to multiple formats",
      ],
      limitations: ["No bulk processing", "Standard processing speed"],
      cta: "Start Basic Plan",
      popular: true,
    },
    {
      name: "Premium",
      price: "$29.99",
      period: "month",
      description: "Perfect for recruiters and HR teams",
      credits: "500 credits",
      features: [
        "500 resume analyses per month",
        "Premium AI parsing with highest accuracy",
        "All file formats supported",
        "24/7 priority support",
        "Advanced insights & recommendations",
        "Bulk processing capabilities",
        "API access",
        "Custom integrations",
        "Team collaboration tools",
      ],
      limitations: [],
      cta: "Start Premium Plan",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core AI-powered resume analysis features.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "ring-2 ring-blue-600" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-semibold">{plan.credits}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
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
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start">
                          <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/auth/sign-up">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
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
