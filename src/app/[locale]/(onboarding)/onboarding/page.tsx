import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries/profiles";
import { getPreferencesByProfileId } from "@/lib/supabase/queries/preferences";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }

  const [profile, preferences] = await Promise.all([
    getProfileById(supabase, user.id).catch(() => null),
    getProfileById(supabase, user.id)
      .then((p) =>
        p ? getPreferencesByProfileId(supabase, user.id).catch(() => null) : null
      )
      .catch(() => null),
  ]);

  // If profile + preferences both exist, onboarding is complete
  if (profile && preferences) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return (
    <section className="w-full max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-800 mb-1">
        {t("title")}
      </h1>
      <p className="text-sm text-stone-500 mb-8">{t("subtitle")}</p>

      <OnboardingWizard
        existingProfile={profile}
        existingPreferences={preferences}
      />
    </section>
  );
}
