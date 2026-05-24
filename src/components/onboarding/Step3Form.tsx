"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { step3Schema, type Step3Input } from "@/lib/validation/onboarding";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Internal field wrapper
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-slate-500">
        {label}
        {required && (
          <span className="text-red-400 ms-0.5" aria-hidden>
            *
          </span>
        )}
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
// Step 3 Form – Background & Lifestyle
// ---------------------------------------------------------------------------

type Props = {
  defaultValues?: Partial<Step3Input>;
  gender?: "male" | "female";
  isPending: boolean;
  onSubmit: (data: Step3Input) => void;
  onBack: () => void;
};

export function Step3Form({
  defaultValues,
  gender,
  isPending,
  onSubmit,
  onBack,
}: Props) {
  const t = useTranslations("onboarding");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema) as Resolver<Step3Input>,
    defaultValues: {
      marital_status: undefined,
      has_children: false,
      children_living_with_me: false,
      ...defaultValues,
    },
  });

  const hasChildren = watch("has_children");

  // Clear children fields when has_children is unchecked
  useEffect(() => {
    if (!hasChildren) {
      setValue("children_count", undefined);
      setValue("children_living_with_me", false);
    }
  }, [hasChildren, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 w-full"
    >
      {/* Education level */}
      <Field id="education_level" label={t("education_label")}>
        <select
          id="education_level"
          disabled={isPending}
          {...register("education_level")}
          className={inputCls()}
        >
          <option value="">—</option>
          {(["high_school", "bachelor", "master", "phd"] as const).map((v) => (
            <option key={v} value={v}>
              {tEnums(`education.${v}` as Parameters<typeof tEnums>[0])}
            </option>
          ))}
        </select>
      </Field>

      {/* Job title */}
      <Field id="job_title" label={t("job_label")}>
        <input
          id="job_title"
          type="text"
          placeholder="Software Engineer"
          disabled={isPending}
          {...register("job_title")}
          className={inputCls()}
        />
      </Field>

      {/* Marital status */}
      <Field
        id="marital_status"
        label={t("marital_status_label")}
        error={
          errors.marital_status?.message
            ? t(errors.marital_status.message as Parameters<typeof t>[0])
            : undefined
        }
        required
      >
        <select
          id="marital_status"
          disabled={isPending}
          aria-invalid={!!errors.marital_status}
          {...register("marital_status")}
          className={inputCls(!!errors.marital_status)}
        >
          <option value="">—</option>
          {(["single", "divorced", "widowed"] as const).map((v) => (
            <option key={v} value={v}>
              {tEnums(`marital_status.${v}` as Parameters<typeof tEnums>[0])}
            </option>
          ))}
        </select>
      </Field>

      {/* Has children – checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="has_children"
          type="checkbox"
          disabled={isPending}
          {...register("has_children")}
          className="h-4 w-4 rounded border-slate-200 accent-slate-900 cursor-pointer"
        />
        <label
          htmlFor="has_children"
          className="text-sm text-slate-600 cursor-pointer"
        >
          {t("has_children_label")}
        </label>
      </div>

      {/* Children details – conditional */}
      {hasChildren && (
        <div className="flex flex-col gap-4 ps-2 border-s-2 border-slate-100">
          <Field
            id="children_count"
            label={t("children_count_label")}
            error={
              errors.children_count?.message
                ? t(errors.children_count.message as Parameters<typeof t>[0])
                : undefined
            }
          >
            <input
              id="children_count"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              placeholder="2"
              disabled={isPending}
              aria-invalid={!!errors.children_count}
              {...register("children_count", { valueAsNumber: true })}
              className={inputCls(!!errors.children_count)}
            />
          </Field>

          <div className="flex items-center gap-3">
            <input
              id="children_living_with_me"
              type="checkbox"
              disabled={isPending}
              {...register("children_living_with_me")}
              className="h-4 w-4 rounded border-slate-200 accent-stone-900 cursor-pointer"
            />
            <label
              htmlFor="children_living_with_me"
              className="text-sm text-stone-600 cursor-pointer"
            >
              {t("children_living_label")}
            </label>
          </div>
        </div>
      )}

      {/* Religious commitment */}
      <Field id="religious_commitment" label={t("religious_commitment_label")}>
        <select
          id="religious_commitment"
          disabled={isPending}
          {...register("religious_commitment")}
          className={inputCls()}
        >
          <option value="">—</option>
          {(["practicing", "moderate", "not_practicing"] as const).map((v) => (
            <option key={v} value={v}>
              {tEnums(
                `religious_commitment.${v}` as Parameters<typeof tEnums>[0]
              )}
            </option>
          ))}
        </select>
      </Field>

      {/* Gender-specific appearance fields */}
      {gender === "female" && (
        <Field id="hijab_status" label={t("hijab_label")}>
          <select
            id="hijab_status"
            disabled={isPending}
            {...register("hijab_status")}
            className={inputCls()}
          >
            <option value="">—</option>
            {(["none", "hijab", "niqab"] as const).map((v) => (
              <option key={v} value={v}>
                {tEnums(`hijab_status.${v}` as Parameters<typeof tEnums>[0])}
              </option>
            ))}
          </select>
        </Field>
      )}

      {gender === "male" && (
        <Field id="beard_status" label={t("beard_label")}>
          <input
            id="beard_status"
            type="text"
            placeholder="Full beard"
            disabled={isPending}
            {...register("beard_status")}
            className={inputCls()}
          />
        </Field>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className={cn(
            "flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {tCommon("back")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {tCommon("next")}
        </button>
      </div>
    </form>
  );
}
