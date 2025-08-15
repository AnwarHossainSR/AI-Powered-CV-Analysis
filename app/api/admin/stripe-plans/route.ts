import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// GET - Fetch all Stripe products and prices
export async function GET() {
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

    // Fetch Stripe products and their prices
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });
        return {
          ...product,
          prices: prices.data,
        };
      })
    );

    return NextResponse.json({ products: productsWithPrices });
  } catch (error) {
    console.error("Error fetching Stripe plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch Stripe plans" },
      { status: 500 }
    );
  }
}

// POST - Create new Stripe product with price and sync to database
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
    } = body;

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: {
        credits: credits?.toString() || "0",
        interval_type,
        features: JSON.stringify(features),
      },
    });

    // Create Stripe price
    const priceData: any = {
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: currency.toLowerCase(),
    };

    if (interval_type !== "one_time") {
      priceData.recurring = {
        interval: interval_type === "yearly" ? "year" : "month",
      };
    }

    const stripePrice = await stripe.prices.create(priceData);

    const billingPlanData = {
      name,
      description,
      price: Number(price),
      currency: currency.toLowerCase(),
      interval_type,
      credits: credits || null,
      features: features || [],
      stripe_price_id: stripePrice.id,
      stripe_product_id: stripeProduct.id,
      is_active: true,
      sort_order: 0,
    };

    const { error: dbError } = await supabase
      .from("billing_plans")
      .insert(billingPlanData);

    if (dbError) {
      console.error("Error syncing to database:", dbError);
      // Archive the Stripe product if database sync fails
      await stripe.products.update(stripeProduct.id, { active: false });
      return NextResponse.json(
        { error: "Failed to sync to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stripe product created and synced to database",
      product: stripeProduct,
      price: stripePrice,
    });
  } catch (error) {
    console.error("Error creating Stripe plan:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe plan" },
      { status: 500 }
    );
  }
}
