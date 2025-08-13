import { createClient } from "@/lib/supabase/server";
import DynamicPricingPage from "./PricingPage";

export default async function PricingPage() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userCredits = 0;
  let currentPlan = "free";

  if (user) {
    // Get user profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, subscription_status")
      .eq("id", user.id)
      .single();

    if (profile) {
      userCredits = profile.credits || 0;
      currentPlan = profile.subscription_status || "free";
    }
  }

  return (
    <DynamicPricingPage
      userCredits={userCredits}
      currentPlan={currentPlan}
      isAuthenticated={!!user}
    />
  );
}
