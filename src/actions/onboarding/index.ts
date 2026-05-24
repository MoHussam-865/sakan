"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { PartnerPreferenceInsert, ProfileInsert } from "@/types/supabase";
import {
  fullOnboardingSchema,
  type FullOnboardingInput,
} from "@/lib/validation/onboarding";

// ---------------------------------------------------------------------------
// Shared result type
// ---------------------------------------------------------------------------

export type OnboardingStepResult = {
  success?: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Final submit (all onboarding steps)
// ---------------------------------------------------------------------------

/**
 * Validates the full onboarding payload, writes profile + preferences,
 * then redirects to the localized dashboard.
 */
export async function finalizeOnboarding(
  data: FullOnboardingInput
): Promise<OnboardingStepResult> {
  const parsed = fullOnboardingSchema.safeParse(data);
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

  const {
    name,
    gender,
    date_of_birth,
    nationality,
    country,
    city,
    height_cm,
    weight_kg,
    skin_color,
    health_status,
    smoking_status,
    education_level,
    job_title,
    marital_status,
    has_children,
    children_count,
    children_living_with_me,
    religious_commitment,
    hijab_status,
    beard_status,
    about_me,
    partner_description,
    min_age,
    max_age,
    accepted_marital_statuses,
    accepted_education_levels,
  } = parsed.data;

  const profileUpsert: ProfileInsert = {
    id: user.id,
    name,
    gender,
    date_of_birth,
    nationality,
    country,
    city,
    height_cm: height_cm ?? null,
    weight_kg: weight_kg ?? null,
    skin_color: skin_color ?? null,
    education_level: education_level ?? null,
    job_title: job_title ?? null,
    marital_status,
    has_children,
    children_count: has_children ? (children_count ?? 1) : 0,
    children_living_with_me: has_children
      ? (children_living_with_me ?? false)
      : false,
    religious_commitment: religious_commitment ?? null,
    hijab_status: hijab_status ?? null,
    beard_status: beard_status ?? null,
    smoking_status: smoking_status ?? null,
    health_status: health_status ?? null,
    about_me: about_me ?? null,
    deleted_at: null,
  };

  const prefUpsert: PartnerPreferenceInsert = {
    profile_id: user.id,
    min_age: min_age ?? null,
    max_age: max_age ?? null,
    min_height_cm: null,
    accepted_marital_statuses: accepted_marital_statuses ?? null,
    accepted_education_levels: accepted_education_levels ?? null,
    partner_description: partner_description ?? null,
  };

  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileUpsert);
    if (profileError) {
      console.error(profileError);
      return { error: "save_failed" };
    }

    const { error: prefError } = await supabase
      .from("partner_preferences")
      .upsert(prefUpsert);
    if (prefError) {
      console.error(prefError);
      return { error: "save_failed" };
    }
  } catch (error) {
    console.error(error);
    return { error: "save_failed" };
  }

  const locale = await getLocale();
  redirect(`/${locale}/dashboard`);
}
