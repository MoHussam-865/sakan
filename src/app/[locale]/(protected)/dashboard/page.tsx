import { getTranslations } from "next-intl/server";

// Dashboard page scaffold – match feed implemented in Phase 7.
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-800 mb-1">
        {t("title")}
      </h1>
      <p className="text-sm text-stone-500">{t("subtitle")}</p>
      {/* Match feed – Phase 7 */}
    </section>
  );
}
