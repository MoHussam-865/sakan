import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPreferencesByProfileId } from "@/lib/supabase/queries/preferences";
import { Link } from "@/i18n/navigation";
import PreferencesForm from "@/components/preferences/PreferencesForm";

export default async function PreferencesPage() {
  const t = await getTranslations("preferences");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected layout guarantees auth; this is a safety net.
  if (!user) return null;

  const preferences = await getPreferencesByProfileId(supabase, user.id).catch(
    () => null
  );

  return (
    <section className="w-full max-w-lg mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true">←</span>
        {t("back_to_matches")}
      </Link>

      {/* Heading */}
      <div className="pb-6 mb-8 border-b border-zinc-200/60">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-1">
          {t("title")}
        </h1>
        <p className="text-sm text-zinc-500">{t("subtitle")}</p>
      </div>

      <PreferencesForm
        defaultValues={{
          min_age: preferences?.min_age,
          max_age: preferences?.max_age,
          accepted_marital_statuses: preferences?.accepted_marital_statuses,
          accepted_education_levels: preferences?.accepted_education_levels,
          partner_description: preferences?.partner_description,
        }}
      />
    </section>
  );
}
