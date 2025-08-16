import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

// DELETE - Archive Stripe product and all its prices
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get all prices for this product and archive them
    const prices = await stripe.prices.list({
      product: params.id,
      active: true,
    });

    // Archive all prices
    await Promise.all(
      prices.data.map((price) =>
        stripe.prices.update(price.id, { active: false })
      )
    );

    // Archive the product
    await stripe.products.update(params.id, { active: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Stripe plan:", error);
    return NextResponse.json(
      { error: "Failed to delete Stripe plan" },
      { status: 500 }
    );
  }
}

// PUT - Update Stripe product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, metadata } = body;

    // Update Stripe product
    const updatedProduct = await stripe.products.update(params.id, {
      name,
      description,
      metadata,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating Stripe plan:", error);
    return NextResponse.json(
      { error: "Failed to update Stripe plan" },
      { status: 500 }
    );
  }
}
