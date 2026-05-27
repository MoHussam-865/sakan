"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { step2Schema, type Step2Input } from "@/lib/validation/onboarding";
import { cn } from "@/lib/utils/cn";

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
      <label htmlFor={id} className="text-sm text-zinc-500">
        {label}
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

function inputCls(hasError?: boolean) {
  return cn(
    "w-full px-4 py-3 rounded-xl border border-zinc-200/50 bg-white bg-gradient-to-br from-white to-zinc-50/50 text-zinc-900",
    "placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-2 transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError && "border-indigo-500/50 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10 focus:border-indigo-500 focus:ring-indigo-500"
  );
}

// ---------------------------------------------------------------------------
// Step 2 Form – Physical & Health
// ---------------------------------------------------------------------------

type Props = {
  defaultValues?: Partial<Step2Input>;
  isPending: boolean;
  onSubmit: (data: Step2Input) => void;
  onBack: () => void;
};

export function Step2Form({ defaultValues, isPending, onSubmit, onBack }: Props) {
  const t = useTranslations("onboarding");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema) as Resolver<Step2Input>,
    defaultValues: {
      height_cm: undefined,
      weight_kg: undefined,
      skin_color: undefined,
      health_status: "",
      smoking_status: "",
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 w-full"
    >
      {/* Height + Weight */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="height_cm"
          label={t("height_label")}
          error={
            errors.height_cm?.message
              ? t(errors.height_cm.message as Parameters<typeof t>[0])
              : undefined
          }
        >
          <input
            id="height_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={100}
            max={250}
            placeholder={t("height_placeholder")}
            disabled={isPending}
            aria-invalid={!!errors.height_cm}
            {...register("height_cm", { valueAsNumber: true })}
            className={inputCls(!!errors.height_cm)}
          />
        </Field>

        <Field
          id="weight_kg"
          label={t("weight_label")}
          error={
            errors.weight_kg?.message
              ? t(errors.weight_kg.message as Parameters<typeof t>[0])
              : undefined
          }
        >
          <input
            id="weight_kg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={30}
            max={300}
            placeholder={t("weight_placeholder")}
            disabled={isPending}
            aria-invalid={!!errors.weight_kg}
            {...register("weight_kg", { valueAsNumber: true })}
            className={inputCls(!!errors.weight_kg)}
          />
        </Field>
      </div>

      {/* Skin color */}
      <Field
        id="skin_color"
        label={t("skin_color_label")}
        error={
          errors.skin_color?.message
            ? t(errors.skin_color.message as Parameters<typeof t>[0])
            : undefined
        }
      >
        <select
          id="skin_color"
          disabled={isPending}
          {...register("skin_color")}
          className={inputCls(!!errors.skin_color)}
        >
          <option value="">—</option>
          {(["white", "wheatish", "brown", "dark"] as const).map((v) => (
            <option key={v} value={v}>
              {tEnums(`skin_color.${v}` as Parameters<typeof tEnums>[0])}
            </option>
          ))}
        </select>
      </Field>

      {/* Health status */}
      <Field id="health_status" label={t("health_label")}>
        <input
          id="health_status"
          type="text"
          placeholder={t("health_placeholder")}
          disabled={isPending}
          {...register("health_status")}
          className={inputCls()}
        />
      </Field>

      {/* Smoking status */}
      <Field id="smoking_status" label={t("smoking_label")}>
        <input
          id="smoking_status"
          type="text"
          placeholder={t("smoking_placeholder")}
          disabled={isPending}
          {...register("smoking_status")}
          className={inputCls()}
        />
      </Field>

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className={cn(
            "flex-1 py-3 rounded-xl border border-zinc-200/50 text-zinc-600 font-medium hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
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
            "flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium hover:from-emerald-500 hover:to-teal-400 hover:shadow-md hover:shadow-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {tCommon("next")}
        </button>
      </div>
    </form>
  );
}
