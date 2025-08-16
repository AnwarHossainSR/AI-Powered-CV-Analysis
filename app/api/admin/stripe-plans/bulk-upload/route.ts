import { updateLastSyncedAt } from "@/lib/queries";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// POST - Create Stripe product and billing plan from bulk upload
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = "usd",
      interval_type,
      credits,
      features = [],
      sort_order = 0,
    } = body;

    // Validate required fields
    if (!name || !description || price === undefined || !interval_type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, price, interval_type",
        },
        { status: 400 }
      );
    }

    // Validate interval type
    if (!["one_time", "monthly", "yearly"].includes(interval_type)) {
      return NextResponse.json(
        {
          error: "Invalid interval_type. Must be: one_time, monthly, or yearly",
        },
        { status: 400 }
      );
    }

    // Check if plan with same name already exists in database
    const { data: existingPlan } = await supabase
      .from("billing_plans")
      .select("id, name")
      .eq("name", name)
      .single();

    if (existingPlan) {
      return NextResponse.json(
        { error: `Plan with name "${name}" already exists` },
        { status: 409 }
      );
    }

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: {
        credits: credits?.toString() || "0",
        interval_type,
        features: JSON.stringify(features),
        sort_order: sort_order.toString(),
      },
    });

    // Create Stripe price
    const priceData: any = {
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: currency.toLowerCase(),
    };

    // Add recurring data for subscriptions
    if (interval_type !== "one_time") {
      priceData.recurring = {
        interval: interval_type === "yearly" ? "year" : "month",
      };
    }

    const stripePrice = await stripe.prices.create(priceData);

    // Prepare billing plan data
    const billingPlanData = {
      name,
      description,
      price: Number(price),
      currency: currency.toLowerCase(),
      interval_type,
      credits: credits === -1 ? -1 : credits || null, // Handle unlimited credits
      features: features || [],
      stripe_price_id: stripePrice.id,
      stripe_product_id: stripeProduct.id,
      is_active: true,
      sort_order: sort_order || 0,
    };

    // Insert into database
    const { data: billingPlan, error: dbError } = await supabase
      .from("billing_plans")
      .insert(billingPlanData)
      .select()
      .single();

    if (dbError) {
      console.error("Error syncing to database:", dbError);

      // Cleanup: Archive the Stripe product if database sync fails
      try {
        await stripe.products.update(stripeProduct.id, { active: false });
        await stripe.prices.update(stripePrice.id, { active: false });
      } catch (cleanupError) {
        console.error("Error cleaning up Stripe objects:", cleanupError);
      }

      return NextResponse.json(
        {
          error:
            "Failed to sync to database. Stripe product has been archived.",
        },
        { status: 500 }
      );
    }

    if (supabase) {
      await updateLastSyncedAt(supabase);
    }

    return NextResponse.json({
      success: true,
      message: "Stripe product created and synced to database",
      product: stripeProduct,
      price: stripePrice,
      billingPlan: billingPlan,
    });
  } catch (error: any) {
    console.error("Error in bulk upload:", error);

    // Handle Stripe-specific errors
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: `Invalid request: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create Stripe plan and billing plan" },
      { status: 500 }
    );
  }
}
