# Phase 7 – Match Dashboard and Filtering

## Summary
Phase 7 delivers the core discovery experience: a server-rendered match feed, a full profile detail view, and the supporting query / utility layer. It also fixes a critical TypeScript error in the Database type contract that was blocking upsert operations in Server Actions.

---

## Bug Fix: `Database` Type Incompatible with `GenericSchema`

**File:** `src/types/supabase.ts`

**Problem:** `@supabase/supabase-js` v2 constrains the generic `Database` type against an internal `GenericSchema` interface which requires:
- `Tables: Record<string, GenericTable>` – where `GenericTable` requires a `Relationships` field.
- `Views: Record<string, GenericView>`
- `Functions: Record<string, GenericFunction>`

The previous `Database` type was missing `Views`, `Functions`, and `Relationships` on each table entry. When TypeScript evaluated `Database["public"] extends GenericSchema`, it resolved to `never`, causing `.upsert()` calls in `src/actions/onboarding/index.ts` to expect `never[]` instead of the correct insert type.

**Fix:** Added `Relationships: []` to every table in `Database.public.Tables`, and added `Views: Record<string, never>` and `Functions: Record<string, never>` to `Database.public`.

---

## Features Implemented

### 1. Server-Side Match Query Pipeline (`src/lib/supabase/queries/profiles.ts`)
- `getMatches(client, filters)` builds a progressive Supabase query applying age range (via `dobRangeFromAgeRange`), marital status, and education level filters. RLS at the database layer enforces the opposite-gender and active-profile constraints.
- `getProfileById(client, id)` fetches a single profile by UUID, returning `null` on miss.

### 2. Match Feed Dashboard (`src/app/[locale]/(protected)/dashboard/page.tsx`)
- Server Component; fetches the authenticated user's profile and partner preferences in parallel.
- Calls `getMatches()` with the user's preference-derived filters.
- Renders a responsive 1→2→3 column grid of `MatchCard` components, or `MatchEmptyState` when no results.

### 3. `MatchCard` Component (`src/components/matches/MatchCard.tsx`)
- Client Component; renders a premium minimalist card: avatar placeholder, name, calculated age, city, education level, and a "View profile" CTA.
- Links to `/profile/[id]` via the i18n-aware `Link` from `@/i18n/navigation`.

### 4. `MatchEmptyState` Component (`src/components/matches/MatchEmptyState.tsx`)
- Client Component; centered empty state with decorative icon and localized "no matches" messaging.

### 5. Profile Detail Page (`src/app/[locale]/(protected)/profile/[id]/page.tsx`)
- Server Component; fetches profile by `id` param, calls `notFound()` on miss or soft-deleted profiles.
- Displays: name, age, about-me section, and a `<dl>` of labeled detail fields (location, nationality, marital status, education, job, religious commitment, hijab status).
- Contains a disabled chat CTA placeholder to be activated in Phase 8.

### 6. Loading Skeletons
- `src/app/[locale]/(protected)/dashboard/loading.tsx` – spinner skeleton for the match feed.
- `src/app/[locale]/(protected)/profile/[id]/loading.tsx` – pulse skeleton mimicking the profile layout.

### 7. Age / Date Utilities (`src/lib/utils/matches.ts`)
- `calculateAge(dateOfBirth)` – integer age from ISO date string.
- `dobRangeFromAgeRange(minAge, maxAge)` – converts a preferred age band to a `[minDob, maxDob]` ISO date range for Supabase `.gte()` / `.lte()` queries.

---

## i18n Keys Used
All UI strings are sourced from the `dashboard`, `profile`, `onboarding`, and `enums` namespaces in `messages/en.json` and `messages/ar.json`. No hardcoded strings were added.

---

## Tests

| Test file | Coverage |
|---|---|
| `tests/unit/lib/utils/matches.test.ts` | `calculateAge`, `dobRangeFromAgeRange` – edge cases, leap years, symmetric ranges |
| `tests/unit/lib/supabase/queries/profiles.test.ts` | `getProfileById` (found / not found / error), `getMatches` (filters, empty result, error) |
| `tests/components/match-feed.test.tsx` | `MatchCard` (name, age, city, education, CTA link, missing-field branches), `MatchEmptyState` (text rendering) |

**Results:** 134 tests, 17 suites – all passing.

---

## Architecture Decisions
- Match filtering is split between the database (RLS for gender / active status) and the application query (age, marital status, education). This keeps the query layer simple while relying on RLS for security-critical constraints.
- The profile detail page calls `notFound()` for both missing profiles and soft-deleted ones, preventing information leakage about deleted accounts.
- `ProfileField` is a local pure component inside the profile detail page file; it's only used in that file so no shared abstraction was created.

---

## New Dependencies
None. Phase 7 uses only existing dependencies.

---

## Files Modified
- `src/types/supabase.ts` – added `Relationships: []` to all tables; added `Views`, `Functions`, `CompositeTypes` to `Database.public`.

## Files Already in Place (verified complete)
- `src/lib/supabase/queries/profiles.ts`
- `src/lib/utils/matches.ts`
- `src/app/[locale]/(protected)/dashboard/page.tsx`
- `src/app/[locale]/(protected)/dashboard/loading.tsx`
- `src/app/[locale]/(protected)/profile/[id]/page.tsx`
- `src/app/[locale]/(protected)/profile/[id]/loading.tsx`
- `src/components/matches/MatchCard.tsx`
- `src/components/matches/MatchEmptyState.tsx`
- `tests/unit/lib/utils/matches.test.ts`
- `tests/unit/lib/supabase/queries/profiles.test.ts`
- `tests/components/match-feed.test.tsx`
