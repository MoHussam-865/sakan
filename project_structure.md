# Project Structure

This file is maintained in sync with the codebase. Update it whenever folders or files are added, moved, or removed.

```
sakan/
├── .env.example                                   # Environment variable template (copy to .env.local)
├── jest.config.ts                                 # Jest configuration – uses next/jest for App Router compat
├── next.config.ts                                 # Next.js configuration – wraps withNextIntl plugin for i18n + SSR client component support
├── project_structure.md                           # This file – live map of the src/ architecture
├── tsconfig.json                                  # TypeScript configuration (strict mode, path aliases)
│
├── messages/                                      # i18n string dictionaries (no hardcoded strings in UI)
│   ├── en.json                                    # English – namespaces: common, nav, locale_switcher, auth, onboarding, dashboard, profile, chat, enums
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
│   │   ├── onboarding/                            # Onboarding Server Actions (profile upsert per step) – Phase 6
│   │   └── chat/                                  # Chat Server Actions (create chat, send message) – Phase 8
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
│   │       │   ├── layout.tsx                     # Onboarding layout – progress bar slot (Phase 6)
│   │       │   └── onboarding/
│   │       │       ├── page.tsx                   # Onboarding page scaffold – 4-step wizard in Phase 6
│   │       │       └── loading.tsx                # Onboarding loading skeleton
│   │       │
│   │       └── (protected)/                       # Route group – authenticated routes, nav bar
│   │           ├── layout.tsx                     # Protected layout – server-side auth guard; redirects unauthenticated users to /login
│   │           └── dashboard/
│   │               ├── page.tsx                   # Dashboard scaffold – uses "dashboard" namespace, match feed in Phase 7
│   │               └── loading.tsx                # Dashboard loading skeleton
│   │
│   ├── components/                                # Reusable UI components, grouped by domain
│   │   ├── auth/
│   │   │   └── OtpForm.tsx                        # Two-step OTP form – email step → code step; uses useActionState with Server Actions
│   │   └── ui/
│   │       └── LocaleSwitcher.tsx                 # EN | عربي toggle – client component using next-intl Link and useLocale
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
│   │   │       ├── chats.ts                       # getChatsByUserId(), getChatById() – chat read queries
│   │   │       └── messages.ts                    # getMessagesByChatId() – message read query
│   │   ├── validation/
│   │   │   └── auth.ts                            # emailSchema + otpSchema – Zod validation for OTP auth form steps
│   │   └── utils/
│   │       ├── cn.ts                              # cn() helper – merges Tailwind classes via clsx + tailwind-merge
│   │       └── env.ts                             # Typed, validated environment variable accessor
│   │
│   └── types/
│       └── supabase.ts                            # Hand-authored Database type, all Row/Insert/Update types and enums
│
└── tests/
    ├── setup.ts                                   # Jest global setup – imports @testing-library/jest-dom
    ├── components/
    │   ├── error-boundary.test.tsx                # Tests for <locale>/error.tsx (renders, retry button, console.error)
    │   ├── locale-layout.test.tsx                 # Tests for <locale>/layout.tsx (lang/dir attributes, notFound guard)
│   ├── locale-switcher.test.tsx               # Tests for LocaleSwitcher (renders locales, aria-current, accessible nav)
│   └── otp-form.test.tsx                      # Tests for OtpForm (email step, OTP step, error states, resend flow)
    └── unit/
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
            │   └── env.test.ts                    # Unit tests for env loader
            └── validation/
                └── auth.test.ts                   # Unit tests for emailSchema and otpSchema
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
| 6 | Planned | Multi-step onboarding wizard |
| 7 | Planned | Match dashboard and filtering |
| 8 | Planned | Real-time chat |
| 9 | Planned | Premium UI/UX polish and accessibility hardening |
| 10 | Planned | Quality gates, CI, and release readiness |
