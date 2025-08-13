// lib/stripe/config.ts
import Stripe from "stripe";
import { config } from "./config";

if (!config.stripeSecretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY is not defined in the environment variables."
  );
}

export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2025-07-30.basil",
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string; // This should match your actual Stripe price IDs
  interval: "month" | "year";
  credits: number;
  features: string[];
  limitations: string[];
  popular?: boolean;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string; // This should match your actual Stripe price IDs
  savings?: string;
}

// Update these with your actual Stripe Price IDs from your Stripe dashboard
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out our service",
    price: 0,
    priceId: "", // No price ID for free plan
    interval: "month",
    credits: 10,
    features: [
      "10 resume analyses",
      "Basic AI parsing",
      "PDF & Word support",
      "Email support",
    ],
    limitations: [
      "No priority support",
      "Basic insights only",
      "No bulk processing",
    ],
    popular: false,
  },
  {
    id: "basic",
    name: "Basic",
    description: "Great for job seekers and professionals",
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || "price_1234567890", // Replace with actual price ID
    interval: "month",
    credits: 100,
    features: [
      "100 resume analyses per month",
      "Advanced AI parsing",
      "All file formats supported",
      "Priority email support",
      "Detailed insights & recommendations",
      "Export to multiple formats",
    ],
    limitations: ["No bulk processing", "Standard processing speed"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Perfect for recruiters and HR teams",
    price: 29.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || "price_0987654321", // Replace with actual price ID
    interval: "month",
    credits: 500,
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
    popular: false,
  },
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_50",
    name: "50 Credits",
    credits: 50,
    price: 4.99,
    priceId: process.env.STRIPE_CREDITS_50_PRICE_ID || "price_credits_50",
  },
  {
    id: "credits_100",
    name: "100 Credits",
    credits: 100,
    price: 8.99,
    priceId: process.env.STRIPE_CREDITS_100_PRICE_ID || "price_credits_100",
    savings: "Save 10%",
  },
  {
    id: "credits_250",
    name: "250 Credits",
    credits: 250,
    price: 19.99,
    priceId: process.env.STRIPE_CREDITS_250_PRICE_ID || "price_credits_250",
    savings: "Save 20%",
  },
  {
    id: "credits_500",
    name: "500 Credits",
    credits: 500,
    price: 34.99,
    priceId: process.env.STRIPE_CREDITS_500_PRICE_ID || "price_credits_500",
    savings: "Save 30%",
  },
];

export function getSubscriptionPlanById(id: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id) || null;
}

export function getCreditPackageById(id: string): CreditPackage | null {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id) || null;
}
