import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Preprocesses a value into an optional number.
 * Converts empty strings, null, undefined, and NaN to undefined before
 * passing to the inner schema (needed for HTML number inputs).
 */
function optionalNumber(min: number, max: number, errMsg: string) {
  return z.optional(
    z
      .unknown()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const n = typeof val === "number" ? val : Number(val);
        return isNaN(n) ? undefined : n;
      })
      .pipe(
        z
          .number({ error: errMsg })
          .min(min, { message: errMsg })
          .max(max, { message: errMsg })
          .optional()
      )
  );
}

/**
 * Preprocesses a value into an optional enum.
 * Converts empty strings to undefined so selects with a blank option work.
 */
function optionalEnum<T extends [string, ...string[]]>(values: T) {
  return z.optional(
    z
      .unknown()
      .transform((val) =>
        val === "" || val === null || val === undefined ? undefined : val
      )
      .pipe(z.enum(values).optional())
  );
}

/**
 * Preprocesses a value into an optional trimmed string.
 * Converts empty/blank strings to undefined.
 */
function optionalStr(maxLen = 2000) {
  return z.optional(
    z
      .unknown()
      .transform((val) =>
        typeof val === "string" && val.trim() === "" ? undefined : val
      )
      .pipe(z.string().trim().max(maxLen).optional())
  );
}

// ---------------------------------------------------------------------------
// Step 1 – Core Identity (all fields required)
// ---------------------------------------------------------------------------

export const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "name_required" })
    .max(100, { message: "name_too_long" }),
  gender: z.enum(["male", "female"] as const, { error: "gender_required" }),
  date_of_birth: z
    .string()
    .min(1, { message: "dob_required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "dob_invalid" })
    .refine(
      (val) => {
        const dob = new Date(val);
        if (isNaN(dob.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age >= 18;
      },
      { message: "dob_underage" }
    ),
  nationality: z.string().trim().min(1, { message: "nationality_required" }),
  country: z.string().trim().min(1, { message: "country_required" }),
  city: z.string().trim().min(1, { message: "city_required" }),
});

export type Step1Input = z.infer<typeof step1Schema>;

// ---------------------------------------------------------------------------
// Step 2 – Physical & Health (all optional)
// ---------------------------------------------------------------------------

export const step2Schema = z.object({
  height_cm: optionalNumber(100, 250, "height_invalid"),
  weight_kg: optionalNumber(30, 300, "weight_invalid"),
  skin_color: optionalEnum([
    "white",
    "wheatish",
    "brown",
    "dark",
  ] as const),
  health_status: optionalStr(200),
  smoking_status: optionalStr(100),
});

export type Step2Input = z.infer<typeof step2Schema>;

// ---------------------------------------------------------------------------
// Step 3 – Background & Lifestyle
// ---------------------------------------------------------------------------

export const step3Schema = z
  .object({
    education_level: optionalEnum([
      "high_school",
      "bachelor",
      "master",
      "phd",
    ] as const),
    job_title: optionalStr(100),
    marital_status: z.enum(["single", "divorced", "widowed"] as const, {
      error: "marital_status_required",
    }),
    has_children: z.boolean(),
    children_count: optionalNumber(0, 20, "children_count_invalid"),
    children_living_with_me: z.boolean().optional(),
    religious_commitment: optionalEnum([
      "practicing",
      "moderate",
      "not_practicing",
    ] as const),
    hijab_status: optionalEnum(["none", "hijab", "niqab"] as const),
    beard_status: optionalStr(50),
  })
  .superRefine((data, ctx) => {
    if (
      data.has_children &&
      (data.children_count === undefined || data.children_count < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "children_count_required",
        path: ["children_count"],
      });
    }
  });

export type Step3Input = z.infer<typeof step3Schema>;

// ---------------------------------------------------------------------------
// Step 4 – Preferences & Bios
// ---------------------------------------------------------------------------

export const step4Schema = z
  .object({
    about_me: optionalStr(2000),
    partner_description: optionalStr(2000),
    min_age: optionalNumber(18, 100, "min_age_invalid"),
    max_age: optionalNumber(18, 100, "max_age_invalid"),
    accepted_marital_statuses: z
      .array(z.enum(["single", "divorced", "widowed"] as const))
      .optional(),
    accepted_education_levels: z
      .array(z.enum(["high_school", "bachelor", "master", "phd"] as const))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.min_age !== undefined &&
      data.max_age !== undefined &&
      data.min_age > data.max_age
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "age_range_invalid",
        path: ["max_age"],
      });
    }
  });

export type Step4Input = z.infer<typeof step4Schema>;

// ---------------------------------------------------------------------------
// Full onboarding payload (all steps combined)
// ---------------------------------------------------------------------------

export const fullOnboardingSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema);

export type FullOnboardingInput = z.infer<typeof fullOnboardingSchema>;
