"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdate, PartnerPreferenceInsert } from "@/types/supabase";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step4Input,
} from "@/lib/validation/onboarding";

// ---------------------------------------------------------------------------
// Shared result type
// ---------------------------------------------------------------------------

export type OnboardingStepResult = {
  success?: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Step 1 – Core Identity
// ---------------------------------------------------------------------------

/**
 * Upserts the core identity fields (name, gender, dob, nationality, location)
 * for the currently authenticated user.  Creates the profile row if absent.
 */
export async function saveOnboardingStep1(
  data: Step1Input
): Promise<OnboardingStepResult> {
  const parsed = step1Schema.safeParse(data);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "save_failed";
    return { error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  const { name, gender, date_of_birth, nationality, country, city } = parsed.data as Step1Input;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any).upsert({
    id: user.id,
    name,
    gender,
    date_of_birth,
    nationality,
    country,
    city,
  });

  if (error) return { error: "save_failed" };

  return { success: true };
}

// ---------------------------------------------------------------------------
// Step 2 – Physical & Health
// ---------------------------------------------------------------------------

/**
 * Partial-updates the physical and health fields on the user's profile.
 * Only provided (non-undefined) fields are written to the database.
 */
export async function saveOnboardingStep2(
  data: Step2Input
): Promise<OnboardingStepResult> {
  const parsed = step2Schema.safeParse(data);
  if (!parsed.success) return { error: "save_failed" };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  const d = parsed.data as Step2Input;
  const updateData: ProfileUpdate = {};
  if (d.height_cm !== undefined) updateData.height_cm = d.height_cm;
  if (d.weight_kg !== undefined) updateData.weight_kg = d.weight_kg;
  if (d.skin_color !== undefined) updateData.skin_color = d.skin_color;
  if (d.health_status !== undefined) updateData.health_status = d.health_status;
  if (d.smoking_status !== undefined) updateData.smoking_status = d.smoking_status;

  if (Object.keys(updateData).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
      .update(updateData)
      .eq("id", user.id);
    if (error) return { error: "save_failed" };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Step 3 – Background & Lifestyle
// ---------------------------------------------------------------------------

/**
 * Updates the background and lifestyle fields (education, marital status,
 * children, religious commitment, appearance) on the user's profile.
 */
export async function saveOnboardingStep3(
  data: Step3Input
): Promise<OnboardingStepResult> {
  const parsed = step3Schema.safeParse(data);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "save_failed";
    return { error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  const d3 = parsed.data as Step3Input;
  const {
    education_level,
    job_title,
    marital_status,
    has_children,
    children_count,
    children_living_with_me,
    religious_commitment,
    hijab_status,
    beard_status,
  } = d3;

  const updateData: ProfileUpdate = {
    marital_status,
    has_children,
    children_count: has_children ? (children_count ?? 1) : 0,
    children_living_with_me: has_children
      ? (children_living_with_me ?? false)
      : false,
  };

  if (education_level !== undefined) updateData.education_level = education_level;
  if (job_title !== undefined) updateData.job_title = job_title;
  if (religious_commitment !== undefined)
    updateData.religious_commitment = religious_commitment;
  if (hijab_status !== undefined) updateData.hijab_status = hijab_status;
  if (beard_status !== undefined) updateData.beard_status = beard_status;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any)
    .update(updateData)
    .eq("id", user.id);

  if (error) return { error: "save_failed" };

  return { success: true };
}

// ---------------------------------------------------------------------------
// Step 4 – Preferences & Bios (final step – redirects to dashboard on success)
// ---------------------------------------------------------------------------

/**
 * Upserts partner preferences and updates the about_me bio on the profile.
 * On success, redirects the user to the match dashboard.
 */
export async function saveOnboardingStep4(
  data: Step4Input
): Promise<OnboardingStepResult> {
  const parsed = step4Schema.safeParse(data);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "save_failed";
    return { error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  const d4 = parsed.data as Step4Input;
  const {
    about_me,
    partner_description,
    min_age,
    max_age,
    accepted_marital_statuses,
    accepted_education_levels,
  } = d4;

  // Update about_me on the profile
  if (about_me !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
      .update({ about_me })
      .eq("id", user.id);
    if (error) return { error: "save_failed" };
  }

  // Upsert partner preferences
  const prefUpsert: PartnerPreferenceInsert = {
    profile_id: user.id,
    min_age: min_age ?? null,
    max_age: max_age ?? null,
    min_height_cm: null,
    accepted_marital_statuses: accepted_marital_statuses ?? null,
    accepted_education_levels: accepted_education_levels ?? null,
    partner_description: partner_description ?? null,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: prefError } = await (supabase.from("partner_preferences") as any)
    .upsert(prefUpsert);

  if (prefError) return { error: "save_failed" };

  const locale = await getLocale();
  redirect(`/${locale}/dashboard`);
}
