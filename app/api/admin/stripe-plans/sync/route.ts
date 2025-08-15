import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all Stripe products with their prices
    const stripeProducts = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const stripePrices = await stripe.prices.list({
      active: true,
    });

    // Group prices by product
    const pricesByProduct = stripePrices.data.reduce((acc, price) => {
      if (price.product && typeof price.product === "string") {
        if (!acc[price.product]) {
          acc[price.product] = [];
        }
        acc[price.product].push(price);
      }
      return acc;
    }, {} as Record<string, Stripe.Price[]>);

    // Sync each product to database
    const syncResults = [];

    for (const product of stripeProducts.data) {
      const productPrices = pricesByProduct[product.id] || [];

      // Use the first active price for the billing plan
      const primaryPrice =
        productPrices.find((p) => p.active) || productPrices[0];

      if (primaryPrice) {
        // Check if billing plan already exists
        const { data: existingPlan } = await supabase
          .from("billing_plans")
          .select("id")
          .eq("stripe_product_id", product.id)
          .single();

        const planData = {
          name: product.name,
          description: product.description || "",
          price: primaryPrice.unit_amount ? primaryPrice.unit_amount / 100 : 0,
          currency: primaryPrice.currency,
          interval_type:
            primaryPrice.recurring?.interval === "month"
              ? "monthly"
              : primaryPrice.recurring?.interval === "year"
              ? "yearly"
              : "one_time",
          credits: product.metadata.credits
            ? Number.parseInt(product.metadata.credits)
            : null,
          features: product.metadata.features
            ? JSON.parse(product.metadata.features)
            : [],
          stripe_price_id: primaryPrice.id,
          stripe_product_id: product.id,
          is_active: product.active,
          sort_order: Number.parseInt(product.metadata.sort_order || "0"),
        };

        if (existingPlan) {
          // Update existing plan
          const { error } = await supabase
            .from("billing_plans")
            .update(planData)
            .eq("id", existingPlan.id);

          if (error) {
            console.error("Error updating plan:", error);
          } else {
            syncResults.push({ action: "updated", product: product.name });
          }
        } else {
          // Create new plan
          const { error } = await supabase
            .from("billing_plans")
            .insert(planData);

          if (error) {
            console.error("Error creating plan:", error);
          } else {
            syncResults.push({ action: "created", product: product.name });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResults.length} products`,
      results: syncResults,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with database" },
      { status: 500 }
    );
  }
}
