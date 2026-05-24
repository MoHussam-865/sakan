import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PartnerPreference } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Fetches the partner preferences row for a given profile.
 * Returns null when preferences have not yet been set.
 */
export async function getPreferencesByProfileId(
  client: Client,
  profileId: string
): Promise<PartnerPreference | null> {
  const { data, error } = await client
    .from("partner_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
