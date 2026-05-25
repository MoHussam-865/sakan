import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries/profiles";
import { calculateAge } from "@/lib/utils/matches";
import { startChat } from "@/actions/chat";
import type { Profile } from "@/types/supabase";

interface ProfileDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  let profile: Profile | null = null;
  try {
    profile = await getProfileById(supabase, id);
  } catch {
    notFound();
  }

  if (!profile || profile.deleted_at) notFound();

  const age = calculateAge(profile.date_of_birth);

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
      >
        ←<span>{t("profile.back_to_matches")}</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-5 pb-8 mb-8 border-b border-slate-200">
        <div
          className="w-16 h-16 rounded-full border-2 border-slate-200 shrink-0"
          aria-hidden="true"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {profile.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("profile.age", { age })}
          </p>
        </div>
      </div>

      {/* About me */}
      {profile.about_me && (
        <div className="pb-8 mb-2 border-b border-slate-100">
          <p className="text-slate-700 leading-relaxed text-sm">
            {profile.about_me}
          </p>
        </div>
      )}

      {/* Detail fields */}
      <dl className="divide-y divide-slate-100">
        {profile.city && (
          <ProfileField
            label={t("onboarding.city_label")}
            value={`${profile.city}, ${profile.country}`}
          />
        )}
        {profile.nationality && (
          <ProfileField
            label={t("onboarding.nationality_label")}
            value={profile.nationality}
          />
        )}
        <ProfileField
          label={t("onboarding.marital_status_label")}
          value={t(`enums.marital_status.${profile.marital_status}`)}
        />
        {profile.education_level && (
          <ProfileField
            label={t("onboarding.education_label")}
            value={t(`enums.education.${profile.education_level}`)}
          />
        )}
        {profile.job_title && (
          <ProfileField
            label={t("onboarding.job_label")}
            value={profile.job_title}
          />
        )}
        {profile.religious_commitment && (
          <ProfileField
            label={t("onboarding.religious_commitment_label")}
            value={t(
              `enums.religious_commitment.${profile.religious_commitment}`
            )}
          />
        )}
        {profile.gender === "female" && profile.hijab_status && (
          <ProfileField
            label={t("onboarding.hijab_label")}
            value={t(`enums.hijab_status.${profile.hijab_status}`)}
          />
        )}
      </dl>

      {/* Chat CTA */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <form action={startChat.bind(null, profile.id)}>
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            {t("dashboard.start_chat")}
          </button>
        </form>
      </div>
    </section>
  );
}

/** Renders a single labeled detail row. */
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3.5">
      <dt className="text-sm text-slate-500 w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}
