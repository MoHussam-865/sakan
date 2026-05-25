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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Decorative icon placeholder */}
      <div
        className="w-14 h-14 rounded-full bg-stone-100 mb-5"
        aria-hidden="true"
      />
      <p className="text-base font-medium text-slate-700">{t("no_matches")}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        {t("no_matches_hint")}
      </p>
      <Link
        href="/preferences"
        className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        {t("update_preferences")}
      </Link>
    </div>
  );
}
