# Project Structure

This file is maintained in sync with the codebase. Update it whenever folders or files are added, moved, or removed.

```
sakan/
├── .env.example                                   # Environment variable template (copy to .env.local)
├── jest.config.ts                                 # Jest configuration – uses next/jest for App Router compat
├── next.config.ts                                 # Next.js configuration
├── project_structure.md                           # This file – live map of the src/ architecture
├── tsconfig.json                                  # TypeScript configuration (strict mode, path aliases)
│
├── messages/                                      # i18n string dictionaries (no hardcoded strings in UI)
│   ├── en.json                                    # English translations
│   └── ar.json                                    # Arabic translations
│
├── src/
│   ├── middleware.ts                              # next-intl locale routing middleware
│   │
│   ├── i18n/
│   │   ├── routing.ts                             # defineRouting config – locales: [en, ar], browser detection
│   │   └── request.ts                             # getRequestConfig – loads messages per request
│   │
│   ├── actions/                                   # (Phase 5+) Next.js Server Actions, grouped by domain
│   │   ├── auth/                                  # Auth Server Actions (OTP request, verify)
│   │   ├── onboarding/                            # Onboarding Server Actions (profile upsert per step)
│   │   └── chat/                                  # Chat Server Actions (create chat, send message)
│   │
│   ├── app/
│   │   ├── globals.css                            # Global Tailwind base styles and design tokens
│   │   ├── layout.tsx                             # Root layout – minimal pass-through; html/body live in [locale]/layout.tsx
│   │   ├── page.tsx                               # Root page – redirects to /{defaultLocale} as middleware fallback
│   │   │
│   │   └── [locale]/
│   │       ├── layout.tsx                         # Locale layout – <html lang dir>, fonts, NextIntlClientProvider
│   │       ├── page.tsx                           # Home page – Phase 5 adds auth-state routing
│   │       ├── loading.tsx                        # Root loading skeleton (spinner)
│   │       ├── error.tsx                          # Root error boundary (uses unstable_retry per Next.js 16)
│   │       ├── not-found.tsx                      # Locale-aware 404 page
│   │       │
│   │       ├── (auth)/                            # Route group – auth layout, no nav
│   │       │   ├── layout.tsx                     # Auth layout – centered container, no navigation
│   │       │   └── login/
│   │       │       ├── page.tsx                   # Login page scaffold – OTP form in Phase 5
│   │       │       └── loading.tsx                # Login loading skeleton
│   │       │
│   │       ├── (onboarding)/                      # Route group – onboarding layout with progress bar
│   │       │   ├── layout.tsx                     # Onboarding layout – progress bar slot (Phase 6)
│   │       │   └── onboarding/
│   │       │       ├── page.tsx                   # Onboarding page scaffold – 4-step wizard in Phase 6
│   │       │       └── loading.tsx                # Onboarding loading skeleton
│   │       │
│   │       └── (protected)/                       # Route group – authenticated routes, nav bar
│   │           ├── layout.tsx                     # Protected layout – nav bar slot (Phase 7), auth guard (Phase 5)
│   │           └── dashboard/
│   │               ├── page.tsx                   # Dashboard scaffold – match feed in Phase 7
│   │               └── loading.tsx                # Dashboard loading skeleton
│   │
│   ├── components/                                # Reusable UI components, grouped by domain
│   │   └── ui/                                    # Shared primitive components (Button, Input, etc.)
│   │
│   ├── lib/                                       # Shared business logic and utilities
│   │   ├── i18n/
│   │   │   └── direction.ts                       # getLocaleDir() – returns 'rtl' | 'ltr' for a locale
│   │   ├── supabase/                              # (Phase 4) Supabase clients (server + browser)
│   │   ├── validation/                            # (Phase 5+) Zod schemas per feature domain
│   │   └── utils/
│   │       ├── cn.ts                              # cn() helper – merges Tailwind classes via clsx + tailwind-merge
│   │       └── env.ts                             # Typed, validated environment variable accessor
│   │
│   └── types/                                     # (Phase 4) Supabase-generated TypeScript types
│
└── tests/
    ├── setup.ts                                   # Jest global setup – imports @testing-library/jest-dom
    ├── components/
    │   ├── error-boundary.test.tsx                # Tests for <locale>/error.tsx (renders, retry button, console.error)
    │   └── locale-layout.test.tsx                 # Tests for <locale>/layout.tsx (lang/dir attributes, notFound guard)
    └── unit/
        └── lib/
            ├── i18n/
            │   └── direction.test.ts              # Unit tests for getLocaleDir()
            └── utils/
                ├── cn.test.ts                     # Unit tests for cn()
                └── env.test.ts                    # Unit tests for env loader
```

## Phase completion status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Planned | Discovery, contracts, schema validation |
| 1 | ✅ Complete | Foundation and tooling |
| 2 | ✅ Complete | App skeleton and route topology |
| 3 | Planned | i18n infrastructure (Arabic/English) |
| 4 | Planned | Supabase integration and typed data contracts |
| 5 | Planned | Authentication (OTP flow) |
| 6 | Planned | Multi-step onboarding wizard |
| 7 | Planned | Match dashboard and filtering |
| 8 | Planned | Real-time chat |
| 9 | Planned | Premium UI/UX polish and accessibility hardening |
| 10 | Planned | Quality gates, CI, and release readiness |
