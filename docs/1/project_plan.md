# Sakan Implementation Plan

## 1) Goal and Scope
Build a production-quality, bilingual (Arabic/English), premium matchmaking platform using Next.js App Router, TypeScript, Tailwind CSS, and Supabase, following all constraints in `docs/instructions.md`.

This plan covers:
- Architecture and repository structure.
- Feature implementation order.
- Data model and server/client boundaries.
- Validation, testing, accessibility, and quality gates.
- Delivery milestones and definition of done.

## 2) Non-Negotiable Rules (From instructions.md)
1. App Router architecture with strict server/client separation.
2. Database mutations only via Server Actions (`"use server"`).
3. Zod validation for all input paths.
4. No hardcoded UI strings; full i18n with Arabic and English from day one.
5. Mandatory tests for all new logic and UI changes.
6. Strict TypeScript (no `any`), shared types, robust error handling.
7. Premium minimalist UI direction (warm neutrals, subtle interactions, no template-like styling).
8. Accessibility and responsive design are required, not optional.
9. Keep `project_structure.md` synced with all file/folder additions.
10. Run static checks before marking tasks complete.

## 3) Current Baseline (Repository State)
- Project is at initial Next.js starter state.
- No Supabase integration yet.
- No i18n infrastructure yet.
- No test infrastructure yet.
- No domain modules (auth, onboarding, matching, chat) yet.

## 4) Target High-Level Architecture

### Runtime Boundary
- Server Components as default for data fetch, metadata, initial rendering.
- Client Components only for interactivity, form state, browser APIs.
- Server Actions for all write operations (create/update chat, profile onboarding, etc.).

### Data Layer
- Supabase PostgreSQL with RLS for profile visibility and chat privacy.
- Typed data contracts generated from Supabase schema.
- Domain-oriented access utilities in `src/lib/supabase` and action handlers in `src/actions`.

### i18n Layer
- `messages/en.json` and `messages/ar.json` as source of truth for UI strings.
- Locale routing and translation loading via `next-intl`.
- RTL support for Arabic direction and typography checks.

### UI Layer
- Shared primitives and feature components.
- Warm-neutral design tokens in global styles.
- Intentional spacing/divider-driven grouping (not heavy card UI).

## 5) Delivery Plan by Phase

## Phase 0 - Discovery, Contracts, and Setup
### Objectives
- Freeze implementation assumptions before coding.
- Confirm product and schema details that impact routing and data contracts.

### Tasks
1. Validate SQL schema in README and convert to versioned migration files.
2. Confirm authentication UX details (OTP provider behavior, resend limits, expiration).
3. Confirm required profile fields vs optional fields.
4. Confirm initial locales (`en`, `ar`) and default locale strategy.
5. Align on matching algorithm strictness and fallback behavior when no matches exist.
6. Review Next.js 16 local docs in `node_modules/next/dist/docs/` and record any deprecations or API differences before coding.

### Outputs
- Approved schema version and migration sequence.
- Confirmed user flows and field-level requirements.
- Finalized locale list and fallback strategy.

## Phase 1 - Foundation and Tooling
### Objectives
- Install and configure all core dependencies and quality tooling.

### Tasks
1. Add dependencies:
   - Runtime: `@supabase/supabase-js`, `next-intl`, `zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `framer-motion`.
   - Dev/test: `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `ts-jest` (or equivalent Jest TS setup), `jest-environment-jsdom`.
2. Configure environment contracts (`.env.example`) for Supabase URL/key and app-level variables.
3. Add shared utility helpers (`cn()` pattern, typed env loader).
4. Add lint and typecheck scripts and ensure they pass in CI/local.
5. Create or initialize `project_structure.md` and keep it updated.

### Outputs
- Working baseline with toolchain and static checks.
- Seeded architecture folders and typed utility foundation.

### Tests
- Smoke tests for utility helpers.
- Basic test runner sanity check.

## Phase 2 - App Skeleton and Route Topology
### Objectives
- Build the app shell, route groups, and error/loading boundaries.

### Tasks
1. Define route groups:
   - Public/auth routes.
   - Onboarding routes.
   - Protected app routes (dashboard, profile view, chat).
2. Add `loading.tsx`, `error.tsx`, and `not-found.tsx` where relevant.
3. Build top-level layout with semantic landmarks (`main`, `nav`, `section`).
4. Create direction-aware layout behavior for Arabic and English.

### Outputs
- Navigable skeleton with placeholders wired to localization keys.

### Tests
- Component tests for layout rendering by locale.
- Error boundary rendering tests.

## Phase 3 - i18n Infrastructure (Arabic/English)
### Objectives
- Enforce zero hardcoded UI strings and robust locale delivery.

### Tasks
1. Integrate `next-intl` provider and locale-aware routing.
2. Add message dictionaries:
   - `messages/en.json`
   - `messages/ar.json`
3. Implement server-side translation loading and client hooks usage.
4. Add lint-style checks or conventions to prevent hardcoded strings in components.
5. Add locale switcher UX and persistence strategy.

### Outputs
- End-to-end translated shell and reusable translation keys by feature namespace.

### Tests
- Unit tests for translation key helpers.
- Component tests verifying localized text appears for both locales.

## Phase 4 - Supabase Integration and Typed Data Contracts
### Objectives
- Establish secure, typed data access and RLS-ready query patterns.

### Tasks
1. Apply README schema via SQL migrations.
2. Generate TypeScript types from Supabase schema.
3. Create typed Supabase clients for server and client contexts.
4. Add repository/data access functions for profiles, preferences, chats, messages.
5. Document RLS policy intent and edge cases in repo docs.

### Outputs
- Type-safe DB layer with stable interfaces for actions/components.

### Tests
- Unit tests for data mapping and query builder utilities.
- Mocked tests for Supabase interactions.

## Phase 5 - Authentication (OTP Flow)
### Objectives
- Implement passwordless sign-in and conditional post-auth routing.

### Tasks
1. Build OTP request and verification UI.
2. Add Server Actions for auth steps where applicable.
3. Implement auth guard for protected routes.
4. Route returning users to dashboard and new users to onboarding.
5. Implement localized auth errors and retries.

### Outputs
- Functional OTP auth flow with locale-aware UX.

### Tests
- Unit tests for auth schema validation.
- Component tests for OTP form states and error/success transitions.

## Phase 6 - Multi-Step Onboarding Wizard
### Objectives
- Build 4-step onboarding with strict validation and robust save behavior.

### Tasks
1. Build step modules aligned with README flow:
   - Step 1: Core identity.
   - Step 2: Physical and health.
   - Step 3: Background and lifestyle.
   - Step 4: Partner preferences and bios.
2. Add Zod schemas per step and combined schema for final submit.
3. Use `react-hook-form` with resolver-based validation.
4. Implement Server Actions to persist each step safely (partial saves + finalization).
5. Handle children-related conditional fields and marital status logic.
6. Add progress indicator and resume logic after interruption.

### Outputs
- Complete onboarding wizard with resilient validation and persistence.

### Tests
- Unit tests for each step schema and transformation logic.
- Component tests for step transitions and conditional fields.
- Server Action tests for success/failure and standardized error payloads.

## Phase 7 - Match Dashboard and Filtering
### Objectives
- Show strict, RLS-safe matches based on user preferences.

### Tasks
1. Build server-side match query pipeline using profile + preference constraints.
2. Respect opposite-gender visibility and active profile constraints from RLS.
3. Add profile card/list UI with premium minimalist styling.
4. Add profile detail view route.
5. Add empty-state UX when no matches found.

### Outputs
- Match feed with strict filtering and localized profile presentation.

### Tests
- Unit tests for age and preference filter helpers.
- Component tests for feed, empty states, and localized labels.

## Phase 8 - Real-Time Chat
### Objectives
- Implement secure private chat with live updates.

### Tasks
1. Create chat initiation flow from a matched profile.
2. Build message thread UI with accessible keyboard interactions.
3. Subscribe to Supabase realtime channels for new messages.
4. Add Server Actions for creating chats and sending messages.
5. Enforce authorization checks consistent with RLS.

### Outputs
- Working private real-time chat between authorized users.

### Tests
- Unit tests for chat/message action validation.
- Component tests for message rendering and send interactions.
- Mocked realtime subscription behavior tests where practical.

## Phase 9 - Premium UI/UX Polish and Accessibility Hardening
### Objectives
- Achieve premium feel while preserving speed and accessibility.

### Tasks
1. Introduce warm-neutral design tokens in global styles.
2. Replace template-like starter patterns with editorial spacing rhythm.
3. Add subtle transitions/micro-interactions for hover and state changes.
4. Ensure keyboard navigation and focus-visible states across flows.
5. Verify RTL layout quality for Arabic.

### Outputs
- Distinct visual identity aligned with instructions.md.

### Tests
- RTL component tests for keyboard navigation flows.
- A11y regression checks (labels, semantics, focus order).

## Phase 10 - Quality Gates, CI, and Release Readiness
### Objectives
- Enforce stable delivery with repeatable checks.

### Tasks
1. Ensure `npm run lint` passes.
2. Ensure `npx tsc --noEmit` passes.
3. Ensure all Jest unit/component tests pass.
4. Validate no hardcoded strings remain in UI code.
5. Validate directives (`"use client"`, `"use server"`) placement.
6. Update `project_structure.md` to reflect final architecture.

### Outputs
- Release-candidate baseline with passing static and test checks.

## 6) Proposed Source Structure (Planned)
This structure is the intended destination after implementation.

```text
src/
  app/
    [locale]/
      (auth)/
      (onboarding)/
      (protected)/
      layout.tsx
      page.tsx
    error.tsx
    not-found.tsx
    globals.css
  actions/
    auth/
    onboarding/
    chat/
  components/
    ui/
    auth/
    onboarding/
    matches/
    chat/
  lib/
    supabase/
    i18n/
    validation/
    utils/
  types/
    supabase.ts
messages/
  en.json
  ar.json
tests/
  unit/
  components/
project_structure.md
```

## 7) Testing Matrix (Mandatory Coverage)
1. Utilities: all helper functions and formatters have unit tests.
2. Validation: all Zod schemas tested for valid and invalid inputs.
3. Server Actions: success path, validation failures, and service errors.
4. UI components: rendering, localization, interactive states.
5. Critical flows: OTP auth, onboarding completion, match feed load, message send.

## 8) Milestones and Acceptance Criteria
1. Milestone A (Foundation): Tooling + i18n + typed Supabase clients working.
2. Milestone B (Onboarding): Full 4-step wizard persisted with validation and tests.
3. Milestone C (Matching): Dashboard and profile details using strict filters.
4. Milestone D (Chat): Private realtime chat production-ready.
5. Milestone E (Hardening): Full quality gates pass and structure docs synced.

Each milestone is complete only when:
- Lint and TypeScript checks pass.
- New tests pass with meaningful assertions.
- No hardcoded strings are introduced.
- Accessibility and responsive behavior are validated.

## 9) Risks and Mitigations
1. Risk: RLS policies block expected app flows.
   Mitigation: Add policy-specific integration tests and staged SQL rollout.
2. Risk: Locale regressions due to missing keys.
   Mitigation: Add key completeness checks and fail build on missing translations.
3. Risk: Onboarding complexity causes drop-offs.
   Mitigation: Persist each step, show clear progress, support resume.
4. Risk: Realtime chat race conditions or duplicates.
   Mitigation: Idempotent message handling and deterministic ordering.

## 10) Open Questions Requiring Confirmation
1. Should onboarding be strictly required before any dashboard access, or allow limited browse mode? 
answer: Strictly Required
2. Should users be allowed to edit onboarding data after completion, and which fields are immutable?
answer: Yes, but Gender and Date of Birth must be immutable
3. Is there a moderation/reporting requirement for profiles and messages in scope for V1?
answer: Basic reporting only for V1 (A "Report User" button)
4. Are push/email notifications for new messages in scope for V1, or only in-app realtime?
answer: Only in-app realtime for V1
5. Should Arabic be the default locale, or should locale be selected from browser preference on first visit?
answer: from browser

## 11) Execution Order Recommendation
Implement Phases 1 through 4 first (foundation, structure, i18n, data contracts), then deliver vertical slices:
1. Auth slice.
2. Onboarding slice.
3. Matching slice.
4. Chat slice.
5. Final polish and hardening.

This sequence minimizes rework, enforces the architecture early, and keeps quality gates active from the first feature.