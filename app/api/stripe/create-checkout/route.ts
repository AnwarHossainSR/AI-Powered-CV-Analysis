import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe, getCreditPackageById, getSubscriptionPlanById } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, packageId, planId } = await request.json()

    if (!type || (type === "credits" && !packageId) || (type === "subscription" && !planId)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    let priceId: string
    let mode: "payment" | "subscription" = "payment"
    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?success=true`
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`

    if (type === "credits") {
      const creditPackage = getCreditPackageById(packageId)
      if (!creditPackage) {
        return NextResponse.json({ error: "Invalid credit package" }, { status: 400 })
      }
      priceId = creditPackage.priceId
    } else if (type === "subscription") {
      const plan = getSubscriptionPlanById(planId)
      if (!plan) {
        return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
      }
      priceId = plan.priceId
      mode = "subscription"
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        type,
        packageId: packageId || "",
        planId: planId || "",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
