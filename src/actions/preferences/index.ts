"use server";

import { createClient } from "@/lib/supabase/server";
import { step4Schema } from "@/lib/validation/onboarding";
import type { PartnerPreferenceInsert } from "@/types/supabase";

// ---------------------------------------------------------------------------
// Shared result type
// ---------------------------------------------------------------------------

export type PreferencesResult = {
  success?: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// Update partner preferences
// ---------------------------------------------------------------------------

/**
 * Validates and upserts the authenticated user's partner preferences.
 * Returns { success: true } on success or { error: string } on failure.
 */
export async function updatePreferences(
  data: unknown
): Promise<PreferencesResult> {
  const parsed = step4Schema.safeParse(data);
  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ??
      "save_failed";
    return { error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  const {
    min_age,
    max_age,
    accepted_marital_statuses,
    accepted_education_levels,
    partner_description,
  } = parsed.data;

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
    const { error: prefError } = await supabase
      .from("partner_preferences")
      .upsert(prefUpsert);

    if (prefError) {
      console.error(prefError);
      return { error: "save_failed" };
    }
  } catch (err) {
    console.error(err);
    return { error: "save_failed" };
  }

  return { success: true };
}
