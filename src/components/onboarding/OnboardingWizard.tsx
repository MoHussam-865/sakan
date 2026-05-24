"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { Profile, PartnerPreference } from "@/types/supabase";
import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  saveOnboardingStep3,
  saveOnboardingStep4,
} from "@/actions/onboarding";
import { StepProgressBar } from "./StepProgressBar";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";
import { Step4Form } from "./Step4Form";
import type { Step1Input, Step2Input, Step3Input, Step4Input } from "@/lib/validation/onboarding";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [profileGender, setProfileGender] = useState<
    "male" | "female" | undefined
  >(existingProfile?.gender);

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
    startTransition(async () => {
      const result = await saveOnboardingStep1(data);
      if (result.success) {
        setProfileGender(data.gender);
        goTo(2);
      } else {
        setServerError(result.error ?? "save_failed");
      }
    });
  }

  function handleStep2Submit(data: Step2Input) {
    startTransition(async () => {
      const result = await saveOnboardingStep2(data);
      if (result.success) goTo(3);
      else setServerError(result.error ?? "save_failed");
    });
  }

  function handleStep3Submit(data: Step3Input) {
    startTransition(async () => {
      const result = await saveOnboardingStep3(data);
      if (result.success) goTo(4);
      else setServerError(result.error ?? "save_failed");
    });
  }

  function handleStep4Submit(data: Step4Input) {
    startTransition(async () => {
      const result = await saveOnboardingStep4(data);
      // If redirect fires, this branch is never reached
      if (result && !result.success) {
        setServerError(result.error ?? "save_failed");
      }
    });
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-8">
      {/* Progress */}
      <StepProgressBar
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        stepLabels={stepLabels}
      />

      {/* Step heading */}
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">
          {t("step_of", { current: step, total: TOTAL_STEPS })}
        </p>
        <h2 className="text-lg font-semibold text-stone-800">
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
          defaultValues={
            existingProfile
              ? {
                  name: existingProfile.name,
                  gender: existingProfile.gender,
                  date_of_birth: existingProfile.date_of_birth,
                  nationality: existingProfile.nationality,
                  country: existingProfile.country,
                  city: existingProfile.city,
                }
              : undefined
          }
          onSubmit={handleStep1Submit}
        />
      )}

      {step === 2 && (
        <Step2Form
          isPending={isPending}
          defaultValues={
            existingProfile
              ? {
                  height_cm: existingProfile.height_cm ?? undefined,
                  weight_kg: existingProfile.weight_kg ?? undefined,
                  skin_color: existingProfile.skin_color ?? undefined,
                  health_status: existingProfile.health_status ?? undefined,
                  smoking_status: existingProfile.smoking_status ?? undefined,
                }
              : undefined
          }
          onSubmit={handleStep2Submit}
          onBack={() => goTo(1)}
        />
      )}

      {step === 3 && (
        <Step3Form
          isPending={isPending}
          gender={profileGender}
          defaultValues={
            existingProfile
              ? {
                  education_level: existingProfile.education_level ?? undefined,
                  job_title: existingProfile.job_title ?? undefined,
                  marital_status: existingProfile.marital_status,
                  has_children: existingProfile.has_children,
                  children_count: existingProfile.children_count ?? undefined,
                  children_living_with_me:
                    existingProfile.children_living_with_me,
                  religious_commitment:
                    existingProfile.religious_commitment ?? undefined,
                  hijab_status: existingProfile.hijab_status ?? undefined,
                  beard_status: existingProfile.beard_status ?? undefined,
                }
              : undefined
          }
          onSubmit={handleStep3Submit}
          onBack={() => goTo(2)}
        />
      )}

      {step === 4 && (
        <Step4Form
          isPending={isPending}
          defaultValues={{
            about_me: existingProfile?.about_me ?? undefined,
            partner_description:
              existingPreferences?.partner_description ?? undefined,
            min_age: existingPreferences?.min_age ?? undefined,
            max_age: existingPreferences?.max_age ?? undefined,
            accepted_marital_statuses:
              existingPreferences?.accepted_marital_statuses ?? undefined,
            accepted_education_levels:
              existingPreferences?.accepted_education_levels ?? undefined,
          }}
          onSubmit={handleStep4Submit}
          onBack={() => goTo(3)}
        />
      )}
    </div>
  );
}
