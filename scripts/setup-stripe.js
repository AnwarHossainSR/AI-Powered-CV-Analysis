#!/usr/bin/env node

// scripts/setup-stripe.js
// Run with: node scripts/setup-stripe.js
// Make sure to set STRIPE_SECRET_KEY in your environment

require("dotenv").config();
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

async function createProducts() {
  try {
    console.log("🚀 Setting up Stripe products and prices...\n");

    // Create subscription products and prices
    const subscriptionPlans = [
      {
        name: "Resume Analyzer Basic",
        description: "Great for job seekers and professionals",
        price: 999, // $9.99 in cents
        credits: 100,
        interval: "month",
        envKey: "STRIPE_BASIC_PRICE_ID",
      },
      {
        name: "Resume Analyzer Premium",
        description: "Perfect for recruiters and HR teams",
        price: 2999, // $29.99 in cents
        credits: 500,
        interval: "month",
        envKey: "STRIPE_PREMIUM_PRICE_ID",
      },
    ];

    // Create credit packages
    const creditPackages = [
      {
        name: "50 Resume Analysis Credits",
        description: "50 additional credits for resume analysis",
        price: 499, // $4.99 in cents
        credits: 50,
        envKey: "STRIPE_CREDITS_50_PRICE_ID",
      },
      {
        name: "100 Resume Analysis Credits",
        description: "100 additional credits for resume analysis",
        price: 899, // $8.99 in cents
        credits: 100,
        envKey: "STRIPE_CREDITS_100_PRICE_ID",
      },
      {
        name: "250 Resume Analysis Credits",
        description: "250 additional credits for resume analysis",
        price: 1999, // $19.99 in cents
        credits: 250,
        envKey: "STRIPE_CREDITS_250_PRICE_ID",
      },
      {
        name: "500 Resume Analysis Credits",
        description: "500 additional credits for resume analysis",
        price: 3499, // $34.99 in cents
        credits: 500,
        envKey: "STRIPE_CREDITS_500_PRICE_ID",
      },
    ];

    const envUpdates = [];

    // Create subscription products and prices
    console.log("📦 Creating subscription products and prices...");
    for (const plan of subscriptionPlans) {
      try {
        // Create product
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            type: "subscription",
            credits: plan.credits.toString(),
          },
        });

        console.log(`✅ Created product: ${product.name} (${product.id})`);

        // Create recurring price
        const price = await stripe.prices.create({
          unit_amount: plan.price,
          currency: "usd",
          recurring: {
            interval: plan.interval,
          },
          product: product.id,
          metadata: {
            type: "subscription",
            credits: plan.credits.toString(),
          },
        });

        console.log(
          `✅ Created price: $${plan.price / 100}/${plan.interval} (${
            price.id
          })`
        );
        envUpdates.push(`${plan.envKey}=${price.id}`);
      } catch (error) {
        console.error(
          `❌ Error creating subscription product ${plan.name}:`,
          error.message
        );
      }
    }

    console.log("\n💳 Creating credit package products and prices...");

    // Create credit package products and prices
    for (const pkg of creditPackages) {
      try {
        // Create product
        const product = await stripe.products.create({
          name: pkg.name,
          description: pkg.description,
          metadata: {
            type: "credits",
            credits: pkg.credits.toString(),
          },
        });

        console.log(`✅ Created product: ${product.name} (${product.id})`);

        // Create one-time price
        const price = await stripe.prices.create({
          unit_amount: pkg.price,
          currency: "usd",
          product: product.id,
          metadata: {
            type: "credits",
            credits: pkg.credits.toString(),
          },
        });

        console.log(`✅ Created price: $${pkg.price / 100} (${price.id})`);
        envUpdates.push(`${pkg.envKey}=${price.id}`);
      } catch (error) {
        console.error(
          `❌ Error creating credit package ${pkg.name}:`,
          error.message
        );
      }
    }

    // Print environment variables to update
    console.log("\n🔧 Add these environment variables to your .env file:");
    console.log("=".repeat(60));
    envUpdates.forEach((update) => console.log(update));
    console.log("=".repeat(60));

    console.log("\n✨ Stripe setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Copy the environment variables above to your .env file");
    console.log("2. Restart your development server");
    console.log("3. Test the pricing page and checkout flow");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

// Verify Stripe key before proceeding
if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "❌ Error: STRIPE_SECRET_KEY not found in environment variables"
  );
  console.log("\nPlease set your Stripe secret key:");
  console.log("export STRIPE_SECRET_KEY=sk_test_...");
  console.log("or add it to your .env file");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
  console.error("❌ Error: Invalid Stripe secret key format");
  console.log('Stripe secret keys should start with "sk_test_" or "sk_live_"');
  process.exit(1);
}

// Helper function to list existing products (optional)
async function listExistingProducts() {
  try {
    const products = await stripe.products.list({ limit: 100 });
    if (products.data.length > 0) {
      console.log("\n📋 Existing products in your Stripe account:");
      products.data.forEach((product) => {
        console.log(`- ${product.name} (${product.id})`);
      });
      console.log("");
    }
  } catch (error) {
    console.log("Could not list existing products:", error.message);
  }
}

// Run the setup
async function main() {
  console.log("🔍 Checking Stripe connection...");

  try {
    const account = await stripe.account.retrieve();
    console.log(
      `✅ Connected to Stripe account: ${account.display_name || account.id}`
    );
  } catch (error) {
    console.error("❌ Failed to connect to Stripe:", error.message);
    process.exit(1);
  }

  await listExistingProducts();
  await createProducts();
}

main();
