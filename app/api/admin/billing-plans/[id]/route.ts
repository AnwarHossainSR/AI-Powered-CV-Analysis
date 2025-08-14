import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// GET - Fetch single billing plan
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: plan, error } = await supabase.from("billing_plans").select("*").eq("id", params.id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error fetching billing plan:", error)
    return NextResponse.json({ error: "Failed to fetch billing plan" }, { status: 500 })
  }
}

// PUT - Update billing plan
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, price, currency, interval_type, credits, features, is_active, sort_order } = body

    const supabase = await createClient()

    // Get existing plan to check if we need to update Stripe
    const { data: existingPlan } = await supabase.from("billing_plans").select("*").eq("id", params.id).single()

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const stripeProductId = existingPlan.stripe_product_id
    let stripePriceId = existingPlan.stripe_price_id

    // Update Stripe product if name or description changed
    if (name !== existingPlan.name || description !== existingPlan.description) {
      await stripe.products.update(stripeProductId, {
        name,
        description,
      })
    }

    // Create new Stripe price if price or interval changed
    if (
      price !== existingPlan.price ||
      currency !== existingPlan.currency ||
      interval_type !== existingPlan.interval_type
    ) {
      const priceData: any = {
        product: stripeProductId,
        unit_amount: Math.round(price * 100),
        currency: currency.toLowerCase(),
      }

      if (interval_type !== "one_time") {
        priceData.recurring = { interval: interval_type }
      }

      const stripePrice = await stripe.prices.create(priceData)
      stripePriceId = stripePrice.id

      // Archive old price
      await stripe.prices.update(existingPlan.stripe_price_id, {
        active: false,
      })
    }

    // Update database
    const { data: updatedPlan, error } = await supabase
      .from("billing_plans")
      .update({
        name,
        description,
        price,
        currency,
        interval_type,
        credits,
        features,
        is_active,
        sort_order,
        stripe_price_id: stripePriceId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error("Error updating billing plan:", error)
    return NextResponse.json({ error: "Failed to update billing plan" }, { status: 500 })
  }
}

// DELETE - Delete billing plan
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get plan details for Stripe cleanup
    const { data: plan } = await supabase.from("billing_plans").select("*").eq("id", params.id).single()

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Archive Stripe product and price
    if (plan.stripe_price_id) {
      await stripe.prices.update(plan.stripe_price_id, { active: false })
    }
    if (plan.stripe_product_id) {
      await stripe.products.update(plan.stripe_product_id, { active: false })
    }

    // Delete from database
    const { error } = await supabase.from("billing_plans").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting billing plan:", error)
    return NextResponse.json({ error: "Failed to delete billing plan" }, { status: 500 })
  }
}
