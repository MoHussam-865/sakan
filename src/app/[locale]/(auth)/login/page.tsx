import { getTranslations } from "next-intl/server";

// Login page scaffold – full OTP form implemented in Phase 5.
export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <section className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-800 mb-1">
        {t("title")}
      </h1>
      <p className="text-sm text-stone-500">{t("subtitle")}</p>
      {/* OTP form – Phase 5 */}
    </section>
  );
}
