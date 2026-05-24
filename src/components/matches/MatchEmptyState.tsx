"use client";

import { useTranslations } from "next-intl";

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
    </div>
  );
}
