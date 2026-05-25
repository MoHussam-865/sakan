"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { calculateAge } from "@/lib/utils/matches";
import type { Profile } from "@/types/supabase";

interface MatchCardProps {
  profile: Profile;
}

/**
 * Displays a concise profile summary card linking to the full profile view.
 * Rendered in the match feed grid on the dashboard.
 */
export default function MatchCard({ profile }: MatchCardProps) {
  const t = useTranslations();
  const age = calculateAge(profile.date_of_birth);

  return (
    <Link
      href={`/profile/${profile.id}`}
      className={cn(
        "group flex flex-col p-5 rounded-2xl border border-slate-200 bg-white",
        "hover:border-slate-300 hover:bg-slate-50 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      )}
    >
      {/* Avatar placeholder */}
      <div
        className="w-10 h-10 rounded-full border-2 border-slate-200 mb-4 shrink-0"
        aria-hidden="true"
      />

      {/* Name and age */}
      <h3 className="font-medium text-slate-900 text-base leading-snug truncate">
        {profile.name}
      </h3>
      <p className="text-sm text-slate-500 mt-0.5">
        {t("profile.age", { age })}
      </p>

      {/* Location and education tags */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        {profile.city && <span>{profile.city}</span>}
        {profile.education_level && (
          <span>{t(`enums.education.${profile.education_level}`)}</span>
        )}
      </div>

      {/* CTA hint */}
      <span className="mt-5 text-xs font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
        {t("dashboard.view_profile")} →
      </span>
    </Link>
  );
}
