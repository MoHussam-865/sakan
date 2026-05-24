import { getTranslations } from "next-intl/server";

// Home page – Phase 5 will add auth-state-based routing here.
export default async function HomePage() {
  const t = await getTranslations("common");

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
        {t("app_name")}
      </h1>
    </main>
  );
}
