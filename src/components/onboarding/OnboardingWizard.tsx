"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { Profile, PartnerPreference } from "@/types/supabase";
import { finalizeOnboarding } from "@/actions/onboarding";
import { StepProgressBar } from "./StepProgressBar";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";
import { Step4Form } from "./Step4Form";
import type {
  FullOnboardingInput,
  Step1Input,
  Step2Input,
  Step3Input,
  Step4Input,
} from "@/lib/validation/onboarding";

// ---------------------------------------------------------------------------
// Resume-step detection
// ---------------------------------------------------------------------------

function getInitialStep(
  profile: Profile | null,
  preferences: PartnerPreference | null
): number {
  if (!profile) return 1;
  if (!preferences) return 4;
  return 1; // Complete – parent page redirects before reaching here
}

function getInitialData(
  profile: Profile | null,
  preferences: PartnerPreference | null
): Partial<FullOnboardingInput> {
  if (!profile) return {};

  return {
    name: profile.name,
    gender: profile.gender,
    date_of_birth: profile.date_of_birth,
    nationality: profile.nationality,
    country: profile.country,
    city: profile.city,
    height_cm: profile.height_cm ?? undefined,
    weight_kg: profile.weight_kg ?? undefined,
    skin_color: profile.skin_color ?? undefined,
    health_status: profile.health_status ?? undefined,
    smoking_status: profile.smoking_status ?? undefined,
    education_level: profile.education_level ?? undefined,
    job_title: profile.job_title ?? undefined,
    marital_status: profile.marital_status,
    has_children: profile.has_children,
    children_count: profile.children_count ?? undefined,
    children_living_with_me: profile.children_living_with_me,
    religious_commitment: profile.religious_commitment ?? undefined,
    hijab_status: profile.hijab_status ?? undefined,
    beard_status: profile.beard_status ?? undefined,
    about_me: profile.about_me ?? undefined,
    partner_description: preferences?.partner_description ?? undefined,
    min_age: preferences?.min_age ?? undefined,
    max_age: preferences?.max_age ?? undefined,
    accepted_marital_statuses:
      preferences?.accepted_marital_statuses ?? undefined,
    accepted_education_levels:
      preferences?.accepted_education_levels ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  existingProfile: Profile | null;
  existingPreferences: PartnerPreference | null;
};

const TOTAL_STEPS = 4;

export function OnboardingWizard({ existingProfile, existingPreferences }: Props) {
  const t = useTranslations("onboarding");

  const [step, setStep] = useState<number>(() =>
    getInitialStep(existingProfile, existingPreferences)
  );
  const [onboardingData, setOnboardingData] = useState<
    Partial<FullOnboardingInput>
  >(() => getInitialData(existingProfile, existingPreferences));
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const stepLabels = [
    t("step1_title"),
    t("step2_title"),
    t("step3_title"),
    t("step4_title"),
  ];

  function goTo(n: number) {
    setServerError(null);
    setStep(n);
  }

  function handleStep1Submit(data: Step1Input) {
    setOnboardingData((prev) => ({ ...prev, ...data }));
    goTo(2);
  }

  function handleStep2Submit(data: Step2Input) {
    setOnboardingData((prev) => ({ ...prev, ...data }));
    goTo(3);
  }

  function handleStep3Submit(data: Step3Input) {
    setOnboardingData((prev) => ({ ...prev, ...data }));
    goTo(4);
  }

  function handleStep4Submit(data: Step4Input) {
    const payload: FullOnboardingInput = {
      ...(onboardingData as FullOnboardingInput),
      ...data,
    };

    startTransition(async () => {
      const result = await finalizeOnboarding(payload);
      // If redirect fires, this branch is never reached
      if (result && !result.success) {
        setServerError(result.error ?? "save_failed");
      }
    });
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm w-full max-w-lg flex flex-col gap-8">
      {/* Progress */}
      <StepProgressBar
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        stepLabels={stepLabels}
      />

      {/* Step heading */}
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
          {t("step_of", { current: step, total: TOTAL_STEPS })}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {stepLabels[step - 1]}
        </h2>
      </div>

      {/* Server-level error */}
      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {t(serverError as Parameters<typeof t>[0])}
        </p>
      )}

      {/* Step forms */}
      {step === 1 && (
        <Step1Form
          isPending={isPending}
          defaultValues={{
            name: onboardingData.name,
            gender: onboardingData.gender,
            date_of_birth: onboardingData.date_of_birth,
            nationality: onboardingData.nationality,
            country: onboardingData.country,
            city: onboardingData.city,
          }}
          onSubmit={handleStep1Submit}
        />
      )}

      {step === 2 && (
        <Step2Form
          isPending={isPending}
          defaultValues={{
            height_cm: onboardingData.height_cm,
            weight_kg: onboardingData.weight_kg,
            skin_color: onboardingData.skin_color,
            health_status: onboardingData.health_status,
            smoking_status: onboardingData.smoking_status,
          }}
          onSubmit={handleStep2Submit}
          onBack={() => goTo(1)}
        />
      )}

      {step === 3 && (
        <Step3Form
          isPending={isPending}
          gender={onboardingData.gender}
          defaultValues={{
            education_level: onboardingData.education_level,
            job_title: onboardingData.job_title,
            marital_status: onboardingData.marital_status,
            has_children: onboardingData.has_children,
            children_count: onboardingData.children_count,
            children_living_with_me: onboardingData.children_living_with_me,
            religious_commitment: onboardingData.religious_commitment,
            hijab_status: onboardingData.hijab_status,
            beard_status: onboardingData.beard_status,
          }}
          onSubmit={handleStep3Submit}
          onBack={() => goTo(2)}
        />
      )}

      {step === 4 && (
        <Step4Form
          isPending={isPending}
          defaultValues={{
            about_me: onboardingData.about_me,
            partner_description: onboardingData.partner_description,
            min_age: onboardingData.min_age,
            max_age: onboardingData.max_age,
            accepted_marital_statuses: onboardingData.accepted_marital_statuses,
            accepted_education_levels: onboardingData.accepted_education_levels,
          }}
          onSubmit={handleStep4Submit}
          onBack={() => goTo(3)}
        />
      )}
    </div>
  );
}
