"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { step1Schema, type Step1Input } from "@/lib/validation/onboarding";
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

// ---------------------------------------------------------------------------
// Shared input class builder
// ---------------------------------------------------------------------------

function inputCls(hasError?: boolean) {
  return cn(
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900",
    "placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError && "border-red-400 focus:border-red-500 focus:ring-red-400"
  );
}

// ---------------------------------------------------------------------------
// Step 1 Form – Core Identity
// ---------------------------------------------------------------------------

type Props = {
  defaultValues?: Partial<Step1Input>;
  isPending: boolean;
  onSubmit: (data: Step1Input) => void;
};

export function Step1Form({ defaultValues, isPending, onSubmit }: Props) {
  const t = useTranslations("onboarding");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      date_of_birth: "",
      nationality: "",
      country: "",
      city: "",
      ...defaultValues,
    },
  });

  const selectedGender = watch("gender");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 w-full"
    >
      {/* Name */}
      <Field
        id="name"
        label={t("name_label")}
        error={errors.name?.message ? t(errors.name.message as Parameters<typeof t>[0]) : undefined}
        required
      >
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Ali Al-Mansouri"
          disabled={isPending}
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          {...register("name")}
          className={inputCls(!!errors.name)}
        />
      </Field>

      {/* Gender */}
      <Field
        id="gender"
        label={t("gender_label")}
        error={
          errors.gender?.message
            ? t(errors.gender.message as Parameters<typeof t>[0])
            : undefined
        }
        required
      >
        <div role="radiogroup" aria-labelledby="gender-label" className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <label
              key={g}
              className={cn(
                "flex-1 text-center px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors",
                selectedGender === g
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              )}
            >
              <input
                type="radio"
                value={g}
                disabled={isPending}
                className="sr-only"
                {...register("gender")}
              />
              {tEnums(`gender.${g}` as Parameters<typeof tEnums>[0])}
            </label>
          ))}
        </div>
      </Field>

      {/* Date of birth */}
      <Field
        id="date_of_birth"
        label={t("dob_label")}
        error={
          errors.date_of_birth?.message
            ? t(errors.date_of_birth.message as Parameters<typeof t>[0])
            : undefined
        }
        required
      >
        <input
          id="date_of_birth"
          type="date"
          disabled={isPending}
          aria-describedby={errors.date_of_birth ? "date_of_birth-error" : undefined}
          aria-invalid={!!errors.date_of_birth}
          {...register("date_of_birth")}
          className={inputCls(!!errors.date_of_birth)}
        />
      </Field>

      {/* Nationality */}
      <Field
        id="nationality"
        label={t("nationality_label")}
        error={
          errors.nationality?.message
            ? t(errors.nationality.message as Parameters<typeof t>[0])
            : undefined
        }
        required
      >
        <input
          id="nationality"
          type="text"
          placeholder="Saudi Arabian"
          disabled={isPending}
          aria-invalid={!!errors.nationality}
          {...register("nationality")}
          className={inputCls(!!errors.nationality)}
        />
      </Field>

      {/* Country + City – two-column grid */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="country"
          label={t("country_label")}
          error={
            errors.country?.message
              ? t(errors.country.message as Parameters<typeof t>[0])
              : undefined
          }
          required
        >
          <input
            id="country"
            type="text"
            placeholder="Saudi Arabia"
            disabled={isPending}
            aria-invalid={!!errors.country}
            {...register("country")}
            className={inputCls(!!errors.country)}
          />
        </Field>

        <Field
          id="city"
          label={t("city_label")}
          error={
            errors.city?.message
              ? t(errors.city.message as Parameters<typeof t>[0])
              : undefined
          }
          required
        >
          <input
            id="city"
            type="text"
            placeholder="Riyadh"
            disabled={isPending}
            aria-invalid={!!errors.city}
            {...register("city")}
            className={inputCls(!!errors.city)}
          />
        </Field>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 mt-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {tCommon("next")}
      </button>
    </form>
  );
}
