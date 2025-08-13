import {
  getCreditPackageById,
  getSubscriptionPlanById,
  stripe,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, packageId, planId } = body;

    if (!type || !["credits", "subscription"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'credits' or 'subscription'" },
        { status: 400 }
      );
    }

    if (type === "credits" && !packageId) {
      return NextResponse.json(
        { error: "packageId is required for credits" },
        { status: 400 }
      );
    }

    if (type === "subscription" && !planId) {
      return NextResponse.json(
        { error: "planId is required for subscription" },
        { status: 400 }
      );
    }

    let priceId: string;
    let mode: "payment" | "subscription" = "payment";
    let lineItems;

    // Build success and cancel URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production"
        ? `https://${request.headers.get("host")}`
        : "http://localhost:3000");

    const successUrl = `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    if (type === "credits") {
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        return NextResponse.json(
          { error: `Credit package '${packageId}' not found` },
          { status: 400 }
        );
      }

      // Validate that the price ID exists
      if (!creditPackage.priceId) {
        return NextResponse.json(
          { error: `Price ID not configured for package '${packageId}'` },
          { status: 500 }
        );
      }

      priceId = creditPackage.priceId;
      lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else if (type === "subscription") {
      const plan = getSubscriptionPlanById(planId);
      if (!plan) {
        return NextResponse.json(
          { error: `Subscription plan '${planId}' not found` },
          { status: 400 }
        );
      }

      // Free plan doesn't need checkout
      if (plan.price === 0) {
        return NextResponse.json(
          { error: "Free plan doesn't require payment" },
          { status: 400 }
        );
      }

      // Validate that the price ID exists
      if (!plan.priceId) {
        return NextResponse.json(
          { error: `Price ID not configured for plan '${planId}'` },
          { status: 500 }
        );
      }

      priceId = plan.priceId;
      mode = "subscription";
      lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        type,
        packageId: packageId || "",
        planId: planId || "",
      },
      // Add subscription-specific options
      ...(mode === "subscription" && {
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: planId || "",
          },
        },
      }),
      // Add payment-specific options
      ...(mode === "payment" && {
        payment_intent_data: {
          metadata: {
            userId: user.id,
            packageId: packageId || "",
          },
        },
      }),
    });

    console.log("Checkout session created successfully:", session.id);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes("No such price")) {
        return NextResponse.json(
          {
            error: "Invalid price configuration. Please contact support.",
            details: "The requested price ID was not found in Stripe",
          },
          { status: 500 }
        );
      }

      if (error.message.includes("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
