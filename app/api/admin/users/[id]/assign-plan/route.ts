import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    // Check admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { planId, credits } = body;

    // Get plan details
    const { data: plan } = await supabase
      .from("billing_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update user profile with new plan
    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_status: plan.name.toLowerCase(),
        credits: credits || plan.credits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Create credit transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: id,
        amount: credits || plan.credits,
        type: "admin_grant",
        description: `Admin assigned ${plan.name} plan`,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error assigning plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
