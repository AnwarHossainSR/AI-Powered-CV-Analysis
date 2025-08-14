import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check admin status
    const { data: adminUser } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single()

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, currency, interval_type, credits, features } = body

    // Validate required fields
    if (!name || !description || price === undefined || !interval_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: {
        credits: credits?.toString() || "0",
        interval_type,
      },
    })

    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: currency || "usd",
      ...(interval_type !== "one_time" && {
        recurring: {
          interval: interval_type === "yearly" ? "year" : "month",
        },
      }),
    })

    // Insert into database
    const { data: billingPlan, error: dbError } = await supabase
      .from("billing_plans")
      .insert({
        name,
        description,
        price,
        currency: currency || "usd",
        interval_type,
        credits,
        features,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, clean up Stripe resources
      await stripe.products.update(stripeProduct.id, { active: false })
      throw dbError
    }

    return NextResponse.json({
      success: true,
      plan: billingPlan,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
    })
  } catch (error) {
    console.error("Error creating billing plan:", error)
    return NextResponse.json(
      { error: "Failed to create billing plan", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
