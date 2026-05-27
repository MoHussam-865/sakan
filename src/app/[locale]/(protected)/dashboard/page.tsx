import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries/profiles";
import { getPreferencesByProfileId } from "@/lib/supabase/queries/preferences";
import { getMatches } from "@/lib/supabase/queries/profiles";
import MatchCard from "@/components/matches/MatchCard";
import MatchEmptyState from "@/components/matches/MatchEmptyState";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected layout guarantees auth; guard is a safety net.
  if (!user) return null;

  const [profile, preferences] = await Promise.all([
    getProfileById(supabase, user.id).catch(() => null),
    getPreferencesByProfileId(supabase, user.id).catch(() => null),
  ]);

  const matches = profile
    ? await getMatches(supabase, {
        minAge: preferences?.min_age ?? null,
        maxAge: preferences?.max_age ?? null,
        acceptedMaritalStatuses:
          preferences?.accepted_marital_statuses ?? null,
        acceptedEducationLevels:
          preferences?.accepted_education_levels ?? null,
      }, profile).catch(() => [])
    : [];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-10">
      <div className="pb-6 mb-8 border-b border-zinc-200/50">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-1">
          {t("title")}
        </h1>
        <p className="text-sm text-zinc-500">{t("subtitle")}</p>
      </div>

      {matches.length === 0 ? (
        <MatchEmptyState />
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label={t("title")}
        >
          {matches.map((match) => (
            <li key={match.id}>
              <MatchCard profile={match} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
