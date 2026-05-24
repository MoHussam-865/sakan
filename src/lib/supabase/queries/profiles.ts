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
 * Returns active profiles of the opposite gender that satisfy the caller's
 * partner preferences.  RLS enforces the opposite-gender + active-profile
 * filter at the DB layer; this query further narrows by age, marital status,
 * and education level based on the provided filters.
 *
 * @param client   Authenticated Supabase server-side client.
 * @param filters  Preference-derived filter values (nulls = no constraint).
 */
export async function getMatches(
  client: Client,
  filters: MatchFilters
): Promise<Profile[]> {
  const { minAge, maxAge, acceptedMaritalStatuses, acceptedEducationLevels } =
    filters;

  const base = client
    .from("profiles")
    .select("*")
    .is("deleted_at", null);

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
