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
      <label htmlFor={id} className="text-sm text-zinc-500">
        {label}
        {required && (
          <span className="text-zinc-500 ms-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-zinc-500">
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
    "w-full px-4 py-3 rounded-xl border border-zinc-200/50 bg-white bg-gradient-to-br from-white to-zinc-50/50 text-zinc-900",
    "placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-2 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError && "border-indigo-500/50 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10 focus:border-indigo-500 focus:ring-indigo-500"
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

  // eslint-disable-next-line react-hooks/incompatible-library
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
          placeholder={t("name_placeholder")}
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
        <div role="radiogroup" aria-label={t("gender_label")} className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <label
              key={g}
              className={cn(
                "flex-1 text-center px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2",
                selectedGender === g
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-indigo-500/50 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10"
                  : "border-zinc-200/50 text-zinc-600 hover:border-zinc-400"
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
          placeholder={t("nationality_placeholder")}
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
            placeholder={t("country_placeholder")}
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
            placeholder={t("city_placeholder")}
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
          "w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium hover:from-emerald-500 hover:to-teal-400 hover:shadow-md hover:shadow-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {tCommon("next")}
      </button>
    </form>
  );
}
