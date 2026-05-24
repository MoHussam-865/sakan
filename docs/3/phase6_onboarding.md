# Phase 6 – Multi-Step Onboarding Wizard

## Overview

Phase 6 implements a 4-step onboarding wizard that collects a user's full profile after their first sign-in. The wizard supports resume logic (start from the last incomplete step), partial saves after each step via Server Actions, and per-step Zod validation with react-hook-form.

---

## Files Created / Modified

### Validation

**`src/lib/validation/onboarding.ts`** (new)

Zod v4 schemas for all four wizard steps, with exported TypeScript types.

| Schema | Type exported | Key details |
|--------|--------------|-------------|
| `step1Schema` | `Step1Input` | name (min 2), gender enum, dob (regex + age ≥18 refine), nationality, country, city |
| `step2Schema` | `Step2Input` | All optional: height\_cm, weight\_kg, skin\_color enum, health\_status, smoking\_status |
| `step3Schema` | `Step3Input` | education\_level (optional enum), job\_title, marital\_status (required), has\_children (boolean), children\_count (required via `superRefine` when has\_children), religious/appearance fields |
| `step4Schema` | `Step4Input` | about\_me, partner\_description (optional texts), min\_age/max\_age with cross-field `superRefine` (min ≤ max), accepted\_marital\_statuses/accepted\_education\_levels (checkbox arrays) |

**Zod v4 compatibility notes:**
- `required_error`/`invalid_type_error` replaced with `error` param for `z.enum()`
- Optional fields that need HTML input preprocessing (NaN handling, empty string → `undefined`) use `z.optional(z.unknown().transform(...).pipe(z.type().optional()))` — the outer `z.optional()` is required so Zod's object schema doesn't reject missing keys as non-optional

---

### Server Actions

**`src/actions/onboarding/index.ts`** (new)

`"use server"` module with four exported Server Actions:

| Action | Behaviour |
|--------|-----------|
| `saveOnboardingStep1(data)` | Validates with `step1Schema`, upserts `profiles` row (creates if absent) |
| `saveOnboardingStep2(data)` | Validates with `step2Schema`, partial-updates profile (only defined fields written) |
| `saveOnboardingStep3(data)` | Validates with `step3Schema`, updates profile including marital status, children fields |
| `saveOnboardingStep4(data)` | Validates with `step4Schema`, updates `profiles.about_me`, upserts `partner_preferences`, then calls `redirect(/${locale}/dashboard)` |

All actions:
- Call `supabase.auth.getUser()` and return `{ error: "auth_required" }` if not authenticated
- Return `{ error: "save_failed" }` on Supabase errors
- Return `{ success: true }` on success (steps 1-3); step 4 redirects instead
- Use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` cast for `.update()` / `.upsert()` calls because the hand-authored `Database` generic type doesn't perfectly match Supabase's internal query builder parameter types

---

### Components

**`src/components/onboarding/StepProgressBar.tsx`** (new)

Visual step progress indicator rendered at the top of the wizard.

- Props: `{ currentStep, totalSteps, stepLabels }`
- Renders dots connected by lines; active dot is larger (`h-2.5 w-2.5`) and dark (`bg-stone-900`)
- `aria-current="step"` on the active dot, `aria-label` on each dot with step name
- `role="navigation"` / `aria-label="Onboarding progress"` on wrapper

**`src/components/onboarding/Step1Form.tsx`** (new)

Core Identity — name, gender (radio pill group), date\_of\_birth, nationality, country, city.

- All fields required; inline `Field` component with `htmlFor`/`id`, optional required asterisk (`aria-hidden`)
- Gender rendered as two styled radio pills using `watch("gender")` for active style
- Uses `useTranslations("onboarding")` for labels and `useTranslations("enums")` for enum options

**`src/components/onboarding/Step2Form.tsx`** (new)

Physical & Health — height\_cm, weight\_kg, skin\_color, health\_status, smoking\_status (all optional).

- Number inputs use `register("height_cm", { valueAsNumber: true })`
- Resolver cast: `zodResolver(step2Schema) as Resolver<Step2Input>` (required because `z.unknown().transform()` gives input fields `unknown` type which is incompatible with the form's output type)

**`src/components/onboarding/Step3Form.tsx`** (new)

Background & Lifestyle — education\_level, job\_title, marital\_status, has\_children, conditional children fields, religious\_commitment, and gender-conditional hijab/beard fields.

- `watch("has_children")` + `useEffect` clears children\_count and children\_living\_with\_me when unchecked
- Gender-conditional fields rendered from `gender` prop passed by wizard after step 1

**`src/components/onboarding/Step4Form.tsx`** (new)

Preferences & Bios — about\_me, partner\_description (textareas), min\_age/max\_age, accepted\_marital\_statuses, accepted\_education\_levels (checkbox groups).

- Checkbox groups use multiple `<input type="checkbox">` with the same `register("accepted_marital_statuses")` name; react-hook-form collects selected values into an array
- Final step — submit button label different from "Next"

**`src/components/onboarding/OnboardingWizard.tsx`** (new)

Orchestrating `"use client"` component managing the full wizard lifecycle.

- `step` state (1–4), `serverError` state, `profileGender` state (updated after step 1 save)
- `const [isPending, startTransition] = useTransition()` — all Server Action calls are wrapped in `startTransition` to keep the UI responsive
- `getInitialStep(profile, preferences)`: returns 1 if no profile, 4 if profile but no preferences, 1 otherwise
- Passes `existingProfile`/`existingPreferences` as `defaultValues` to the appropriate step form for resume support
- Handles `null` / `undefined` action results gracefully (redirect from step 4 causes the `await` to be abandoned — no result check needed for the redirect path)

---

### Page & Layout

**`src/app/[locale]/(onboarding)/onboarding/page.tsx`** (modified)

Server Component entry point:
1. Checks auth via `supabase.auth.getUser()` — redirects to `/login` if not authenticated
2. Fetches `profiles` and `partner_preferences` rows in parallel with `Promise.all`
3. If both exist → redirect to `/dashboard` (onboarding already complete)
4. Otherwise renders `<OnboardingWizard existingProfile={...} existingPreferences={...} />`

**`src/app/[locale]/(onboarding)/layout.tsx`** (minor modification)

Updated comment: progress bar lives inside `OnboardingWizard`, not the layout.

---

### i18n

**`messages/en.json`** and **`messages/ar.json`** (modified)

Added to the `onboarding` namespace:

```
name_required, name_too_long, gender_required, dob_required, dob_invalid,
dob_underage, nationality_required, country_required, city_required,
height_invalid, weight_invalid, marital_status_required,
children_count_required, children_count_invalid, min_age_invalid,
max_age_invalid, age_range_invalid, save_failed, auth_required
```

---

### Tests

**`tests/unit/lib/validation/onboarding.test.ts`** (new) — 28 tests

Covers all four schemas: valid payloads, trimming, error message keys, age-18 boundary, NaN → undefined conversion, `superRefine` cross-field validation (children\_count\_required, age\_range\_invalid), and optional field handling.

**`tests/unit/actions/onboarding.test.ts`** (new) — 14 tests

Mocks `next-intl/server` (getLocale → "en"), `next/navigation` (redirect throws `REDIRECT:url`), and `@/lib/supabase/server`. Uses `var` declarations (instead of `const`) for mock function references to avoid temporal dead zone errors when `jest.mock()` factories are hoisted.

Tests each action: success path, `auth_required`, `save_failed`, and redirect verification for step 4.

**`tests/components/onboarding-wizard.test.tsx`** (new) — 8 tests

Mocks `next-intl`, `@/actions/onboarding`, and `react` (`useTransition` stubbed to immediate callback). Tests: initial step based on props, progress bar presence, step 1 fields visible, advance to step 2 after successful save, server error display on failure, back navigation.

---

## Architecture Decisions

1. **Per-step partial saves** — each step saves independently so data is never lost if the user navigates away
2. **Resume logic in page server component** — the page detects completion state and redirects if already done; the wizard detects the last incomplete step to start from
3. **Server Actions return error keys, not human strings** — error keys like `"save_failed"` are translated by the client via `t(errorKey)` to keep the server layer locale-independent
4. **`z.optional()` outer wrap** — required in Zod v4 when using `z.unknown().transform().pipe()` inside `z.object()` to correctly handle absent (not just `undefined`) keys
5. **Resolver cast** — `zodResolver(schema) as Resolver<OutputType>` is needed because `z.unknown().transform()` produces `unknown` as the input-side type, causing a type mismatch with `useForm<OutputType>`
