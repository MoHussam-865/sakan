# Phase 5 – Authentication (OTP Flow)

## Summary

Implemented passwordless OTP authentication via Supabase Auth, including the two-step email → code form, server actions, protected route guards, and auth-state routing. Also resolved a Next.js 16 deprecation by migrating `middleware.ts` to `proxy.ts`.

---

## Features Implemented

### 1. Zod Validation Schemas (`src/lib/validation/auth.ts`)
- `emailSchema` – validates and normalises (trim + lowercase) the user's email address.  
- `otpSchema` – validates email + 6-digit numeric token for the verification step.  
- Error messages use i18n key names (e.g. `"email_required"`) so the form can look them up via `useTranslations`.

### 2. Auth Server Actions (`src/actions/auth/index.ts`)
Three `"use server"` actions:
- **`requestOtp`** – calls `supabase.auth.signInWithOtp` with `shouldCreateUser: true`. Returns `{ success, email }` or `{ fieldError | error }`.
- **`verifyOtp`** – calls `supabase.auth.verifyOtp({ type: 'email' })`. On success, checks whether the user already has a profile row:  
  - Profile exists → `redirect(/{locale}/dashboard)`  
  - No profile → `redirect(/{locale}/onboarding)`  
  - On failure → returns `{ error: "otp_invalid" }` for the form to display.
- **`signOut`** – calls `supabase.auth.signOut()` then redirects to `/{locale}/login`.

### 3. `OtpForm` Client Component (`src/components/auth/OtpForm.tsx`)
- Two-step UI: **EmailStep** (email input + "Send code" button) then **OtpStep** (6-digit code input + "Verify" + "Resend code").
- Uses React 19's `useActionState` to bind each step to its server action with progressive-enhancement form semantics.
- `useEffect` on `requestOtp` state triggers the step transition when `{ success: true }` is returned.
- Accessible: `aria-invalid`, `aria-describedby`, `role="alert"` for errors, `autoFocus` on OTP input, `one-time-code` autocomplete.
- RTL-safe premium minimal styling (stone palette, `focus-visible` rings, `transition-colors`).

### 4. Login Page (`src/app/[locale]/(auth)/login/page.tsx`)
- Replaced the Phase 2 scaffold with the fully wired `<OtpForm />`.
- Server component still renders the heading/subtitle via `getTranslations("auth")`.

### 5. Protected Layout Auth Guard (`src/app/[locale]/(protected)/layout.tsx`)
- Converted to an async Server Component.
- Calls `supabase.auth.getUser()` – uses the secure server-side check (not `getSession()`).
- Unauthenticated visitors are redirected to `/{locale}/login` before any protected page renders.

### 6. Home Page Routing (`src/app/[locale]/page.tsx`)
- Authenticated users → `/{locale}/dashboard`.
- Unauthenticated users → `/{locale}/login`.
- Replaces the Phase 2 static branding stub.

### 7. Session Refresh in Proxy (`src/proxy.ts`)
- Extended the next-intl middleware to also refresh the Supabase session cookie on every request via `supabase.auth.getUser()`.
- Auth cookies set by Supabase are copied onto the next-intl response so they reach the browser.
- Renamed from `middleware.ts` → `proxy.ts` per the **Next.js 16** file-convention change (see below).

---

## Architectural Decisions

- **`getUser()` not `getSession()`**: The Supabase SSR docs emphasise using `getUser()` server-side because it validates the JWT against the Supabase Auth server, preventing token-forgery attacks. `getSession()` only reads from the cookie without re-validation.
- **Error key strings as i18n keys**: Server actions return message keys (e.g. `"otp_invalid"`) rather than translated strings. The client component translates them via `useTranslations`, keeping actions locale-agnostic.
- **`useActionState` over `react-hook-form` for auth**: The OTP flow is a pure progressive-enhancement form where no client-side field state is needed beyond what the server action returns. `useActionState` is the idiomatic React 19 / Next.js 16 pattern for this case.

---

## Next.js 16 Breaking Change Fixed

- **`middleware.ts` → `proxy.ts`**: Next.js 16 deprecated the `middleware` file convention and renamed it to `proxy`. The exported function is now named `proxy`. The `config.matcher` export is unchanged.
- **`createNextIntlPlugin`**: Added to `next.config.ts` (required for next-intl client components to work during SSR/prerender builds).

---

## New Dependencies

None. All dependencies (`@supabase/ssr`, `next-intl`, `zod`, `react-hook-form`, `clsx`, `tailwind-merge`) were already installed in Phase 1.

---

## Files Created / Modified

| File | Change |
|------|--------|
| `src/lib/validation/auth.ts` | **Created** – Zod schemas for email and OTP |
| `src/actions/auth/index.ts` | **Created** – `requestOtp`, `verifyOtp`, `signOut` server actions |
| `src/components/auth/OtpForm.tsx` | **Created** – Two-step client OTP form |
| `src/proxy.ts` | **Created** (renamed from `middleware.ts`) – Supabase session refresh + next-intl locale routing |
| `src/app/[locale]/(auth)/login/page.tsx` | **Updated** – renders `OtpForm` |
| `src/app/[locale]/(protected)/layout.tsx` | **Updated** – server-side auth guard |
| `src/app/[locale]/page.tsx` | **Updated** – auth-state routing |
| `next.config.ts` | **Updated** – added `createNextIntlPlugin` |
| `tests/unit/lib/validation/auth.test.ts` | **Created** – 11 unit tests for `emailSchema` / `otpSchema` |
| `tests/components/otp-form.test.tsx` | **Created** – 11 component tests for `OtpForm` |
| `project_structure.md` | **Updated** – reflects Phase 5 additions |

---

## Quality Gates Passed

- `npx tsc --noEmit` → **0 errors**
- `npm run lint` → **0 errors, 0 warnings**
- `npx jest` → **66 / 66 tests pass** (12 suites)
- `npm run build` → **Production build succeeds, no deprecation warnings**
