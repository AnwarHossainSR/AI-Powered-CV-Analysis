export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  devSupabaseRedirectUrl:
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
    "http://localhost:3000/dashboard",
  stripeSecretKey:
    "sk_test_51R5PHODihXPChrkjUwsiInxE2XI1iuJHaq3sj87qExAzrE1t4GXCgQr2IlJoJsR6Vvr3bvfQ1o6upuWWT39QB1Gl00CVdCXqaS",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || "",
} as const;

export type Config = typeof config;
