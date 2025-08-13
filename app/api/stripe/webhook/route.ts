import { config } from "@/lib/config";
import {
  getCreditPackageById,
  getSubscriptionPlanById,
  stripe,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

const webhookSecret = config.stripeWebhookSecret!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, type, packageId, planId } = session.metadata!;

        if (type === "credits" && packageId) {
          // Handle credit purchase
          const creditPackage = getCreditPackageById(packageId);
          if (creditPackage) {
            // Add credits to user account
            const { error } = await supabase.rpc("update_user_credits", {
              user_uuid: userId,
              credit_amount: creditPackage.credits,
              transaction_type: "purchase",
              description_text: `Purchased ${creditPackage.credits} credits`,
            });

            if (error) {
              console.error("Failed to add credits:", error);
            }
          }
        } else if (type === "subscription" && planId) {
          // Handle subscription creation
          const plan = getSubscriptionPlanById(planId);
          if (plan) {
            // Update user subscription
            const { error } = await supabase
              .from("profiles")
              .update({
                subscription_status: plan.id,
                subscription_id: session.subscription as string,
                credits: plan.credits, // Reset credits for new subscription
              })
              .eq("id", userId);

            if (error) {
              console.error("Failed to update subscription:", error);
            }

            // Record transaction
            await supabase.from("credit_transactions").insert({
              user_id: userId,
              amount: plan.credits,
              type: "purchase",
              description: `${plan.name} subscription - ${plan.credits} credits`,
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("subscription_id", subscriptionId)
          .single();

        if (profile) {
          const plan = getSubscriptionPlanById(profile.subscription_status);
          if (plan) {
            // Reset monthly credits
            const { error } = await supabase.rpc("update_user_credits", {
              user_uuid: profile.id,
              credit_amount: plan.credits,
              transaction_type: "purchase",
              description_text: `Monthly ${plan.name} subscription credits`,
            });

            if (error) {
              console.error("Failed to reset monthly credits:", error);
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by subscription ID and downgrade to free
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            subscription_id: null,
          })
          .eq("subscription_id", subscription.id);

        if (error) {
          console.error("Failed to downgrade subscription:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
