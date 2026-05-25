# Project Structure

This file is maintained in sync with the codebase. Update it whenever folders or files are added, moved, or removed.

```
sakan/
├── .env.example                                   # Environment variable template (copy to .env.local)
├── jest.config.ts                                 # Jest configuration – uses next/jest for App Router compat
├── next.config.ts                                 # Next.js configuration – wraps withNextIntl plugin for i18n + SSR client component support
├── project_structure.md                           # This file – live map of the src/ architecture
├── tsconfig.json                                  # TypeScript configuration (strict mode, path aliases)
├── .github/
│   └── workflows/
│       └── quality-gates.yml                      # CI workflow running lint, typecheck, tests, and build on push/PR
│
├── messages/                                      # i18n string dictionaries (no hardcoded strings in UI)
│   ├── en.json                                    # English – namespaces: common, nav, locale_switcher, auth, onboarding, dashboard, preferences, profile, chat, enums
│   └── ar.json                                    # Arabic  – same namespace structure as en.json
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql                 # Full initial schema: enums, tables, RLS policies, updated_at triggers
│
├── src/
│   ├── proxy.ts                               # Combined proxy: Supabase session refresh + next-intl locale routing (Next.js 16 proxy convention)
│   │
│   ├── i18n/
│   │   ├── routing.ts                             # defineRouting config – locales: [en, ar], browser detection
│   │   ├── request.ts                             # getRequestConfig – loads messages per request
│   │   └── navigation.ts                          # createNavigation helpers – type-safe Link, redirect, usePathname, useRouter
│   │
│   ├── actions/                                   # Next.js Server Actions, grouped by domain
│   │   ├── auth/
│   │   │   └── index.ts                           # requestOtp(), verifyOtp(), signOut() – OTP auth Server Actions
│   │   ├── onboarding/
│   │   │   └── index.ts                           # finalizeOnboarding() – validates full payload, upserts profile + preferences, redirects to dashboard
│   │   ├── preferences/
│   │   │   └── index.ts                           # updatePreferences() – validates and upserts partner_preferences for the authenticated user
│   │   └── chat/
│   │       └── index.ts                           # startChat() – finds/creates chat and redirects; sendMessage() – validates and inserts a message
│   │
│   ├── app/
│   │   ├── globals.css                            # Global Tailwind base styles and design tokens
│   │   ├── layout.tsx                             # Root layout – minimal pass-through; html/body live in [locale]/layout.tsx
│   │   ├── page.tsx                               # Root page – redirects to /{defaultLocale} as middleware fallback
│   │   │
│   │   └── [locale]/
│   │       ├── layout.tsx                         # Locale layout – <html lang dir>, fonts, NextIntlClientProvider
│   │       ├── page.tsx                           # Home page – redirects authenticated users to /dashboard, guests to /login
│   │       ├── loading.tsx                        # Root loading skeleton (spinner)
│   │       ├── error.tsx                          # Root error boundary (uses unstable_retry per Next.js 16)
│   │       ├── not-found.tsx                      # Locale-aware 404 page
│   │       │
│   │       ├── (auth)/                            # Route group – auth layout, no nav
│   │       │   ├── layout.tsx                     # Auth layout – centered container, no navigation
│   │       │   └── login/
│   │       │       ├── page.tsx                   # Login page – renders OtpForm; heading/subtitle from auth.* keys
│   │       │       └── loading.tsx                # Login loading skeleton
│   │       │
│   │       ├── (onboarding)/                      # Route group – onboarding layout with progress bar
│   │       │   ├── layout.tsx                     # Onboarding layout – flex column wrapper; progress bar lives inside wizard
│   │       │   └── onboarding/
│   │       │       ├── page.tsx                   # Onboarding page – fetches existing profile/preferences, redirects if complete, renders OnboardingWizard
│   │       │       └── loading.tsx                # Onboarding loading skeleton
│   │       │
│   │       └── (protected)/                       # Route group – authenticated routes, nav bar
│   │           ├── layout.tsx                     # Protected layout – server-side auth guard; redirects unauthenticated users to /login
│   │           ├── chat/
│   │           │   ├── page.tsx                   # Chat list page – Server Component; shows all conversations with partner name; empty state with hint
│   │           │   ├── loading.tsx                # Chat list loading skeleton – avatar + name row pulses
│   │           │   └── [chatId]/
│   │           │       ├── page.tsx               # Chat thread page – Server Component; fetches initial messages + partner profile; renders ChatThread
│   │           │       └── loading.tsx            # Chat thread loading skeleton – header + message bubbles + input pulses
│   │           ├── dashboard/
│   │           │   ├── page.tsx                   # Match feed dashboard – fetches user profile + preferences, calls getMatches(), renders MatchCard grid or MatchEmptyState
│   │           │   └── loading.tsx                # Dashboard loading skeleton – centred spinner
│   │           └── profile/
│   │               └── [id]/
│   │                   ├── page.tsx               # Profile detail page – fetches profile by id, renders detail fields, Start Chat form action; notFound() on miss/soft-deleted
│   │                   └── loading.tsx            # Profile detail loading skeleton – pulse placeholder mimicking layout
│   │
│   ├── components/                                # Reusable UI components, grouped by domain
│   │   ├── auth/
│   │   │   └── OtpForm.tsx                        # Two-step OTP form – email step → code step; uses useActionState with Server Actions
│   │   ├── matches/
│   │   │   ├── MatchCard.tsx                      # Client Component – profile summary card; links to detail view, shows age, city, education
│   │   │   └── MatchEmptyState.tsx                # Client Component – empty state with a Link button to /preferences when no matches are found
│   │   ├── chat/
│   │   │   └── ChatThread.tsx                     # Client Component – scrollable message list + send input + Supabase Realtime subscription for live updates
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.tsx               # Client Component – manages current step state, calls Server Actions via useTransition
│   │   │   ├── StepProgressBar.tsx                # Step progress indicator – dots + connectors; aria-current on active step
│   │   │   ├── Step1Form.tsx                      # Core Identity form – name, gender (radio), dob, nationality, country, city
│   │   │   ├── Step2Form.tsx                      # Physical & Health form – height, weight, skin color, health, smoking (all optional)
│   │   │   ├── Step3Form.tsx                      # Background & Lifestyle form – education, job, marital status, children, religious, appearance
│   │   │   └── Step4Form.tsx                      # Preferences & Bios form – about me, age range, accepted statuses/education, partner description
│   │   └── ui/
│   │       ├── LocaleSwitcher.tsx                 # EN | عربي toggle – client component using next-intl Link and useLocale
│   │       └── NavBar.tsx                         # Client Component – sticky top nav bar; active link detection via usePathname, sign-out form action
│   │
│   ├── lib/                                       # Shared business logic and utilities
│   │   ├── i18n/
│   │   │   └── direction.ts                       # getLocaleDir() – returns 'rtl' | 'ltr' for a locale
│   │   ├── supabase/
│   │   │   ├── server.ts                          # createClient() for Server Components/Actions – cookie-aware via @supabase/ssr
│   │   │   ├── browser.ts                         # createClient() for Client Components – @supabase/ssr browser client
│   │   │   └── queries/
│   │   │       ├── profiles.ts                    # getProfileById(), getMatches() – profile read queries
│   │   │       ├── preferences.ts                 # getPreferencesByProfileId() – partner preferences read query
│   │   │       ├── chats.ts                       # getChatsByUserId(), getChatById(), getChatListForUser() – chat read queries; ChatWithPartner type
│   │   │       └── messages.ts                    # getMessagesByChatId() – message read query
│   │   ├── validation/
│   │   │   ├── auth.ts                            # emailSchema + otpSchema – Zod validation for OTP auth form steps
│   │   │   ├── chat.ts                            # sendMessageSchema – Zod validation for message content (trim, min 1, max 1000)
│   │   │   └── onboarding.ts                      # step1-4 Zod schemas for onboarding wizard validation
│   │   └── utils/
│   │       ├── cn.ts                              # cn() helper – merges Tailwind classes via clsx + tailwind-merge
│   │       ├── env.ts                             # Typed, validated environment variable accessor
│   │       └── matches.ts                         # calculateAge(), dobRangeFromAgeRange() – date/age helpers for the match query pipeline
│   │
│   └── types/
│       └── supabase.ts                            # Hand-authored Database type – Row/Insert/Update/Relationships per table, Views/Functions/Enums; satisfies GenericSchema for supabase-js v2
│
└── tests/
    ├── setup.ts                                   # Jest global setup – imports @testing-library/jest-dom
    ├── components/
│   ├── error-boundary.test.tsx                # Tests for <locale>/error.tsx (renders, retry button, console.error)
│   ├── locale-layout.test.tsx                 # Tests for <locale>/layout.tsx (lang/dir attributes, notFound guard)
│   ├── locale-switcher.test.tsx               # Tests for LocaleSwitcher (renders locales, aria-current, accessible nav)
│   ├── chat.test.tsx                          # Tests for ChatThread (renders messages, send/fail states, whitespace guard)
│   ├── match-feed.test.tsx                    # Tests for MatchCard (name/age/city/edu/link) and MatchEmptyState (empty state text)
│   ├── nav-bar.test.tsx                       # Tests for NavBar landmark label, active-link aria-current, and sign-out action
│   ├── otp-form.test.tsx                      # Tests for OtpForm (email step, OTP step, error states, resend flow)
│   └── onboarding-wizard.test.tsx             # Tests for OnboardingWizard (step rendering, navigation, server error display)
    └── unit/
        ├── actions/
        │   ├── chat.test.ts                   # Tests for startChat() and sendMessage() (auth guard, participant check, redirect, error paths)
        │   └── onboarding.test.ts             # Tests for saveOnboardingStep1-4 (auth guard, validation, Supabase mocks, redirect)
        └── lib/
            ├── i18n/
            │   └── direction.test.ts              # Unit tests for getLocaleDir()
            ├── supabase/
            │   └── queries/
            │       ├── profiles.test.ts           # Mocked tests for getProfileById() and getMatches()
            │       ├── preferences.test.ts        # Mocked tests for getPreferencesByProfileId()
            │       ├── chats.test.ts              # Mocked tests for getChatsByUserId() and getChatById()
            │       └── messages.test.ts           # Mocked tests for getMessagesByChatId()
            ├── utils/
            │   ├── cn.test.ts                     # Unit tests for cn()
            │   ├── env.test.ts                    # Unit tests for env loader
            │   └── matches.test.ts                # Unit tests for calculateAge() and dobRangeFromAgeRange()
            └── validation/
                ├── auth.test.ts                   # Unit tests for emailSchema and otpSchema
                └── onboarding.test.ts             # Unit tests for step1–step4 schemas (required fields, optional handling, refinements)
```

## Phase completion status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Planned | Discovery, contracts, schema validation |
| 1 | ✅ Complete | Foundation and tooling |
| 2 | ✅ Complete | App skeleton and route topology |
| 3 | ✅ Complete | i18n infrastructure (Arabic/English) |
| 4 | ✅ Complete | Supabase integration and typed data contracts |
| 5 | ✅ Complete | Authentication (OTP flow) |
| 6 | ✅ Complete | Multi-step onboarding wizard |
| 7 | ✅ Complete | Match dashboard and filtering |
| 8 | ✅ Complete | Real-time chat |
| 9 | ✅ Complete | Premium UI/UX polish and accessibility hardening |
| 10 | ✅ Complete | Quality gates, CI, and release readiness |
