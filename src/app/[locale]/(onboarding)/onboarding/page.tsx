import { getTranslations } from "next-intl/server";

// Onboarding wizard entry point – 4-step wizard implemented in Phase 6.
export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");

  return (
    <section className="w-full max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-800 mb-1">
        {t("title")}
      </h1>
      <p className="text-sm text-stone-500">{t("subtitle")}</p>
      {/* Multi-step wizard – Phase 6 */}
    </section>
  );
}
