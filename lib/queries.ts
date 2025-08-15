import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

// Cache functions to prevent duplicate queries during SSR
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
});

// Cache functions to prevent duplicate queries during SSR
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
});

export const getUserResumes = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
});

export const getResume = cache(async (resumeId: string, userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
});

export const getResumeWithParsedData = cache(
  async (resumeId: string, userId: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resumes")
      .select(
        `
      *,
      parsed_data(*)
    `
      )
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  }
);

export const getUserCreditTransactions = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
});

export const getBillingPlans = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw error;
  return data || [];
});

// Admin queries
export const getAllUsers = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      resumes(count),
      credit_transactions(count)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
});

export const getAllResumes = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select(
      `
      *,
      profiles(full_name, email, subscription_status)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
});

export const getAllTransactions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_transactions")
    .select(
      `
      *,
      profiles(full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
});

export const getParseData = cache(async (resumeId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parsed_data")
    .select("*")
    .eq("resume_id", resumeId)
    .single();

  if (error) throw error;
  return data;
});
