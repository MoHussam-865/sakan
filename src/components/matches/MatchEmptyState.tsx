"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Empty state shown on the dashboard when no matches are found for the
 * viewer's current preferences.
 */
export default function MatchEmptyState() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Editorial hairline ring icon */}
      <div
        className="w-14 h-14 rounded-full border-2 border-zinc-200/60 mb-6"
        aria-hidden="true"
      />
      <p className="text-base font-medium text-zinc-800">{t("no_matches")}</p>
      <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
        {t("no_matches_hint")}
      </p>
      <Link
        href="/preferences"
        className="mt-8 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        {t("update_preferences")}
      </Link>
    </div>
  );
}
