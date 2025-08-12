import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const CREDIT_PACKAGES = [
  {
    id: "credits_50",
    credits: 50,
    price: 4.99,
    priceId: "price_credits_50", // This would be your actual Stripe Price ID
    popular: false,
  },
  {
    id: "credits_100",
    credits: 100,
    price: 9.99,
    priceId: "price_credits_100",
    popular: true,
  },
  {
    id: "credits_250",
    credits: 250,
    price: 19.99,
    priceId: "price_credits_250",
    popular: false,
  },
  {
    id: "credits_500",
    credits: 500,
    price: 34.99,
    priceId: "price_credits_500",
    popular: false,
  },
]

export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    credits: 100,
    priceId: "price_basic_monthly",
    features: [
      "100 resume analyses per month",
      "Advanced AI parsing",
      "All file formats supported",
      "Priority email support",
      "Detailed insights & recommendations",
      "Export to multiple formats",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.99,
    credits: 500,
    priceId: "price_premium_monthly",
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
  },
]

export function getCreditPackageById(id: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id)
}

export function getSubscriptionPlanById(id: string) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id)
}
