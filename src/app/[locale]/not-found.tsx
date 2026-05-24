import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-800">
        {t("not_found_title")}
      </h1>
      <p className="text-sm text-slate-500">{t("not_found_description")}</p>
      <Link
        href="/"
        className="px-5 py-2 text-sm font-medium text-slate-700 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {t("not_found_back")}
      </Link>
    </main>
  );
}
