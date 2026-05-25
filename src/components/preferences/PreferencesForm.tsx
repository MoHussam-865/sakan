"use client";

import React, { useTransition, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { step4Schema, type Step4Input } from "@/lib/validation/onboarding";
import { updatePreferences } from "@/actions/preferences";
import { cn } from "@/lib/utils/cn";
import type { EducationType, MaritalStatusType } from "@/types/supabase";

// ---------------------------------------------------------------------------
// Internal field wrapper
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-slate-500">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError?: boolean) {
  return cn(
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900",
    "placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError && "border-red-400 focus:border-red-500 focus:ring-red-400"
  );
}

// ---------------------------------------------------------------------------
// PreferencesForm
// ---------------------------------------------------------------------------

type PreferencesDefaults = {
  min_age?: number | null;
  max_age?: number | null;
  accepted_marital_statuses?: MaritalStatusType[] | null;
  accepted_education_levels?: EducationType[] | null;
  partner_description?: string | null;
};

type Props = {
  defaultValues?: PreferencesDefaults;
};

export default function PreferencesForm({ defaultValues }: Props) {
  const t = useTranslations("onboarding");
  const tPref = useTranslations("preferences");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Input>({
    resolver: zodResolver(step4Schema) as Resolver<Step4Input>,
    defaultValues: {
      about_me: undefined,
      partner_description: defaultValues?.partner_description ?? "",
      min_age: defaultValues?.min_age ?? undefined,
      max_age: defaultValues?.max_age ?? undefined,
      accepted_marital_statuses:
        defaultValues?.accepted_marital_statuses ?? [],
      accepted_education_levels:
        defaultValues?.accepted_education_levels ?? [],
    },
  });

  const maritalOptions: MaritalStatusType[] = ["single", "divorced", "widowed"];
  const educationOptions: EducationType[] = [
    "high_school",
    "bachelor",
    "master",
    "phd",
  ];

  function onSubmit(data: Step4Input) {
    setSaved(false);
    setServerError(null);
    startTransition(async () => {
      const result = await updatePreferences(data);
      if (result.error) {
        setServerError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 w-full"
    >
      {/* Age range */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="min_age"
          label={t("min_age_label")}
          error={
            errors.min_age?.message
              ? t(errors.min_age.message as Parameters<typeof t>[0])
              : undefined
          }
        >
          <input
            id="min_age"
            type="number"
            inputMode="numeric"
            min={18}
            max={100}
            placeholder="25"
            disabled={isPending}
            aria-invalid={!!errors.min_age}
            aria-describedby={errors.min_age ? "min_age-error" : undefined}
            {...register("min_age", { valueAsNumber: true })}
            className={inputCls(!!errors.min_age)}
          />
        </Field>

        <Field
          id="max_age"
          label={t("max_age_label")}
          error={
            errors.max_age?.message
              ? t(errors.max_age.message as Parameters<typeof t>[0])
              : undefined
          }
        >
          <input
            id="max_age"
            type="number"
            inputMode="numeric"
            min={18}
            max={100}
            placeholder="35"
            disabled={isPending}
            aria-invalid={!!errors.max_age}
            aria-describedby={errors.max_age ? "max_age-error" : undefined}
            {...register("max_age", { valueAsNumber: true })}
            className={inputCls(!!errors.max_age)}
          />
        </Field>
      </div>

      {/* Accepted marital statuses */}
      <fieldset>
        <legend className="text-sm text-slate-500 mb-3">
          {t("accepted_marital_statuses_label")}
        </legend>
        <div className="flex flex-wrap gap-3">
          {maritalOptions.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"
            >
              <input
                type="checkbox"
                value={status}
                disabled={isPending}
                {...register("accepted_marital_statuses")}
                className="h-4 w-4 rounded border-slate-200 accent-stone-900"
              />
              {tEnums(
                `marital_status.${status}` as Parameters<typeof tEnums>[0]
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Accepted education levels */}
      <fieldset>
        <legend className="text-sm text-slate-500 mb-3">
          {t("accepted_education_levels_label")}
        </legend>
        <div className="flex flex-wrap gap-3">
          {educationOptions.map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"
            >
              <input
                type="checkbox"
                value={level}
                disabled={isPending}
                {...register("accepted_education_levels")}
                className="h-4 w-4 rounded border-slate-200 accent-stone-900"
              />
              {tEnums(`education.${level}` as Parameters<typeof tEnums>[0])}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Partner description */}
      <Field id="partner_description" label={tPref("partner_description_label")}>
        <textarea
          id="partner_description"
          rows={4}
          placeholder={tPref("partner_description_placeholder")}
          disabled={isPending}
          {...register("partner_description")}
          className={cn(inputCls(), "resize-none")}
        />
      </Field>

      {/* Server error / success feedback */}
      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-emerald-600 font-medium">
          {tPref("saved")}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? tCommon("loading") : tPref("save")}
      </button>
    </form>
  );
}
