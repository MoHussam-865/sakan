import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Profile,
  MaritalStatusType,
  EducationType,
} from "@/types/supabase";
import { dobRangeFromAgeRange } from "@/lib/utils/matches";

type Client = SupabaseClient<Database>;

/**
 * Filters applied to the match query, derived from the viewer's partner preferences.
 * All fields are nullable – absent values mean "no filter on that dimension".
 */
export interface MatchFilters {
  minAge: number | null;
  maxAge: number | null;
  acceptedMaritalStatuses: MaritalStatusType[] | null;
  acceptedEducationLevels: EducationType[] | null;
}

/**
 * Fetches a single profile by its UUID.
 * Returns null when the row does not exist or RLS blocks access.
 */
export async function getProfileById(
  client: Client,
  id: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Resolves a profile UUID from an authenticated Supabase user UUID.
 * Returns null when onboarding has not created a profile yet.
 */
export async function getProfileIdByUserId(
  client: Client,
  userId: string
): Promise<string | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

/**
 * Returns active profiles of the opposite gender that satisfy the caller's
 * partner preferences. This query filters by:
 * - Opposite gender (based on currentUserProfile.gender)
 * - Not the current user (user_id != currentUserProfile.user_id)
 * - Age, marital status, and education level based on the provided filters.
 *
 * @param client              Authenticated Supabase server-side client.
 * @param filters             Preference-derived filter values (nulls = no constraint).
 * @param currentUserProfile  The current user's profile (used for gender and user_id filtering).
 */
export async function getMatches(
  client: Client,
  filters: MatchFilters,
  currentUserProfile: Profile
): Promise<Profile[]> {
  const { minAge, maxAge, acceptedMaritalStatuses, acceptedEducationLevels } =
    filters;

  // Determine opposite gender
  const oppositeGender = currentUserProfile.gender === "male" ? "female" : "male";

  const base = client
    .from("profiles")
    .select("*")
    .is("deleted_at", null)
    .eq("gender", oppositeGender)
    .neq("user_id", currentUserProfile.user_id);

  const withAge =
    minAge !== null && maxAge !== null
      ? (() => {
          const { minDob, maxDob } = dobRangeFromAgeRange(minAge, maxAge);
          return base.gte("date_of_birth", minDob).lte("date_of_birth", maxDob);
        })()
      : base;

  const withMarital =
    acceptedMaritalStatuses && acceptedMaritalStatuses.length > 0
      ? withAge.in("marital_status", acceptedMaritalStatuses)
      : withAge;

  const withEducation =
    acceptedEducationLevels && acceptedEducationLevels.length > 0
      ? withMarital.in("education_level", acceptedEducationLevels)
      : withMarital;

  const { data, error } = await withEducation.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data ?? [];
}
