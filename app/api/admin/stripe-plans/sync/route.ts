import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin access (same as bulk upload)
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

    console.log("Starting Stripe sync...");

    // Test basic Stripe connection first
    try {
      const account = await stripe.accounts.retrieve();
      console.log("Connected to Stripe account:", account.id);
    } catch (accountError) {
      console.log(
        "Could not fetch account info (might be normal):",
        accountError
      );
    }

    // Get ALL Stripe products (including inactive ones for debugging)
    const allProducts = await stripe.products.list({ limit: 100 });
    const allPrices = await stripe.prices.list({ limit: 100 });

    console.log(`Found ${allProducts.data.length} total products in Stripe`);
    console.log(`Found ${allPrices.data.length} total prices in Stripe`);

    // Get only active products for syncing
    const stripeProducts = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    if (stripeProducts.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active Stripe products found to sync",
        results: [],
        debug: {
          totalProductsInStripe: allProducts.data.length,
          totalPricesInStripe: allPrices.data.length,
          activeProductsToSync: 0,
        },
      });
    }

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
    const errors = [];

    for (const product of stripeProducts.data) {
      const productPrices = pricesByProduct[product.id] || [];
      const primaryPrice =
        productPrices.find((p) => p.active) || productPrices[0];

      if (!primaryPrice) {
        console.log(`Skipping product ${product.name} - no active price found`);
        errors.push(`Product "${product.name}" has no active prices`);
        continue;
      }

      try {
        // Check if product exists in our database
        const { data: existingPlan, error: fetchError } = await supabase
          .from("billing_plans")
          .select("id, name")
          .eq("stripe_product_id", product.id)
          .maybeSingle(); // Use maybeSingle instead of single

        if (fetchError) {
          console.error("Error fetching existing plan:", fetchError);
          errors.push(
            `Database error for "${product.name}": ${fetchError.message}`
          );
          continue;
        }

        // Map interval type properly (matching bulk upload logic)
        let intervalType = "one_time";
        if (primaryPrice.recurring?.interval === "month") {
          intervalType = "monthly";
        } else if (primaryPrice.recurring?.interval === "year") {
          intervalType = "yearly";
        }

        // Parse features safely
        let features = [];
        try {
          if (product.metadata.features) {
            features = JSON.parse(product.metadata.features);
          }
        } catch (e) {
          console.warn(`Invalid features JSON for product ${product.name}`);
          features = [];
        }

        // Handle credits properly (matching bulk upload logic)
        let credits = null;
        if (product.metadata.credits) {
          const creditValue = Number.parseInt(product.metadata.credits);
          credits = creditValue === -1 ? -1 : creditValue || null;
        }

        // Prepare billing plan data (exact same structure as bulk upload)
        const billingPlanData = {
          name: product.name,
          description: product.description || "",
          price: primaryPrice.unit_amount
            ? Number(primaryPrice.unit_amount / 100)
            : 0,
          currency: primaryPrice.currency.toLowerCase(),
          interval_type: intervalType,
          credits: credits,
          features: features,
          stripe_price_id: primaryPrice.id,
          stripe_product_id: product.id,
          is_active: product.active,
          sort_order: Number.parseInt(product.metadata.sort_order || "0"),
        };

        if (existingPlan) {
          // Product exists - update it
          console.log(
            `Updating existing plan: ${existingPlan.name} (ID: ${existingPlan.id})`
          );

          const { error } = await supabase
            .from("billing_plans")
            .update(billingPlanData)
            .eq("id", existingPlan.id);

          if (error) {
            console.error(`Failed to update product ${product.name}:`, error);
            errors.push(
              `Update failed for "${product.name}": ${error.message}`
            );
          } else {
            console.log(`Successfully updated: ${product.name}`);
            syncResults.push({ action: "updated", product: product.name });
          }
        } else {
          // Product not found - create it
          console.log(`Creating new plan for: ${product.name}`);

          const { data: billingPlan, error } = await supabase
            .from("billing_plans")
            .insert(billingPlanData)
            .select()
            .single();

          if (error) {
            console.error(`Failed to create product ${product.name}:`, error);
            console.error(
              "Insert data was:",
              JSON.stringify(billingPlanData, null, 2)
            );
            errors.push(
              `Create failed for "${product.name}": ${error.message}`
            );
          } else {
            console.log(
              `Successfully created: ${product.name} with ID: ${billingPlan?.id}`
            );
            syncResults.push({
              action: "created",
              product: product.name,
              id: billingPlan?.id,
            });
          }
        }
      } catch (productError) {
        console.error(
          `Unexpected error processing ${product.name}:`,
          productError
        );
        errors.push(`Unexpected error for "${product.name}": ${productError}`);
      }
    }

    return NextResponse.json({
      success: syncResults.length > 0 || errors.length === 0,
      message: `Processed ${stripeProducts.data.length} products. ${syncResults.length} successful, ${errors.length} errors.`,
      results: syncResults,
      errors: errors,
      debug: {
        totalProductsInStripe: allProducts.data.length,
        totalPricesInStripe: allPrices.data.length,
        activeProductsToSync: stripeProducts.data.length,
        processedSuccessfully: syncResults.length,
        errorCount: errors.length,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync with database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
