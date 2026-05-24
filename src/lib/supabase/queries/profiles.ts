import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Profile } from "@/types/supabase";

type Client = SupabaseClient<Database>;

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
 * partner preferences.  RLS enforces the opposite-gender + active filter at
 * the DB layer; this query further narrows by age preference.
 *
 * @param client   Authenticated Supabase client (server-side).
 * @param minAge   Minimum acceptable age (inclusive).
 * @param maxAge   Maximum acceptable age (inclusive).
 */
export async function getMatches(
  client: Client,
  minAge: number,
  maxAge: number
): Promise<Profile[]> {
  const today = new Date();
  const maxDob = new Date(today);
  maxDob.setFullYear(today.getFullYear() - minAge);
  const minDob = new Date(today);
  minDob.setFullYear(today.getFullYear() - maxAge - 1);

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .is("deleted_at", null)
    .gte("date_of_birth", minDob.toISOString().slice(0, 10))
    .lte("date_of_birth", maxDob.toISOString().slice(0, 10))
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
