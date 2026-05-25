# Phase 8 – Real-Time Chat

## Summary
Phase 8 delivers end-to-end private messaging between matched users. It covers chat initiation from a profile page, a conversation list view, a real-time message thread powered by Supabase Realtime, and full server-side authorization.

---

## Features Implemented

### 1. Chat Server Actions (`src/actions/chat/index.ts`)

**`startChat(otherUserId, _formData)`**
- Bound in the profile detail page as a `<form>` action (`startChat.bind(null, profile.id)`).
- Performs a direction-agnostic lookup for an existing chat room between the two users (either `user1_id/user2_id` ordering).
- Creates a new room via `.insert()` if none exists.
- Calls `redirect()` to navigate directly to `/[locale]/chat/[chatId]` on success.
- Throws on auth failure, self-chat attempt, or DB error (caught by the nearest `error.tsx` boundary).

**`sendMessage(chatId, content)`**
- Called directly from the `ChatThread` Client Component.
- Validates content via `sendMessageSchema` (trim → min 1 → max 1000).
- Re-verifies the caller is a participant before inserting, complementing RLS.
- Returns `{ success: true }` or `{ error: string }`.

### 2. Zod Validation Schema (`src/lib/validation/chat.ts`)
- `sendMessageSchema` – trims whitespace first, then enforces `min(1)` / `max(1000)`.
- `SendMessageInput` inferred type exported alongside the schema.

### 3. Chat Query Layer (`src/lib/supabase/queries/chats.ts`)
- Added `getChatListForUser(client, userId)` – fetches all chats for the user then resolves partner profile names in a single batch `.in()` query (avoids N+1). Returns `ChatWithPartner[]`.
- `ChatWithPartner` exported type: `Chat & { partner: { id: string; name: string } }`.

### 4. Chat List Page (`src/app/[locale]/(protected)/chat/page.tsx`)
- Server Component; fetches `getChatListForUser` and renders an accessible `<ul>` of conversation items.
- Empty state with decorative icon and localized hint linking to the dashboard.
- Companion `loading.tsx` with avatar + name row pulse skeletons.

### 5. Chat Thread Page (`src/app/[locale]/(protected)/chat/[chatId]/page.tsx`)
- Server Component; fetches chat, messages, and partner profile in parallel.
- Authorization double-check: `notFound()` if the caller is not a participant.
- Passes initial messages and i18n strings down to `ChatThread` as props (no translation hook in Client Component).
- Fixed-height layout (`h-[calc(100vh-3.5rem)]`) so the message area scrolls independently of the page.
- Companion `loading.tsx` with header + bubble + input pulse skeletons.

### 6. `ChatThread` Component (`src/components/chat/ChatThread.tsx`)
- Client Component; manages local `messages` state initialized from `initialMessages`.
- **Realtime subscription**: subscribes to `postgres_changes` `INSERT` events on the `messages` table filtered by `chat_id`. Only appends messages from the *other* participant to avoid duplication with optimistic updates.
- **Optimistic send**: the sender's own message is appended immediately after a successful `sendMessage()` call; the input is restored on failure.
- Auto-scrolls to the bottom sentinel `<div ref={bottomRef}>` after each state update.
- `aria-live="polite"` on the message list for screen-reader accessibility.
- `Enter` key sends; disabled state while submitting.

### 7. Profile Page – Start Chat CTA (`src/app/[locale]/(protected)/profile/[id]/page.tsx`)
- Replaced the disabled placeholder `<button>` with a live `<form action={startChat.bind(null, profile.id)}>`.
- Fully progressive-enhancement compatible (works without JS via standard HTML form POST).

### 8. NavBar Update (`src/components/ui/NavBar.tsx`)
- Added `nav.chat` link (`/chat`) between the dashboard and preferences links.

### 9. i18n Keys Added
Both `messages/en.json` and `messages/ar.json` received two new `chat` namespace keys:
- `chat.no_chats_hint` – contextual hint below the "no conversations" empty state.
- `chat.send_failed` – inline error shown in the thread when `sendMessage` returns an error.

---

## Tests

| Test file | Coverage |
|---|---|
| `tests/unit/actions/chat.test.ts` | `startChat` (existing/new room, redirect, auth guard, self-chat guard, DB error) · `sendMessage` (success, empty/long content, auth guard, non-participant, insert error) |
| `tests/components/chat.test.tsx` | `ChatThread` renders initial messages, input/button states, successful send clears input, failed send shows error + restores input, whitespace-only send is blocked |

**Results after Phase 8:** 154 tests, 19 suites – all passing.

---

## Architecture Decisions

- **`startChat` throws instead of returning an error object** so its return type satisfies Next.js's `(formData: FormData) => void | Promise<void>` form action contract. Fatal errors (unauthenticated, self-chat, DB failure) surface through the `error.tsx` boundary.
- **Optimistic messages use a `opt-{timestamp}` ID** prefix. The realtime handler skips messages from `currentUserId`, so there is no duplication between the optimistic entry and any realtime echo.
- **Partner profile name is resolved server-side** in the thread page (`getProfileById`) so the `ChatThread` Client Component receives plain props and never needs to call Supabase directly for profile data.
- **`getChatListForUser` deduplicates partner IDs** with `new Set()` before the batch `.in()` query, ensuring correctness even if the same user somehow appears in multiple chats.

---

## New Dependencies
None. Phase 8 uses only existing project dependencies (`@supabase/supabase-js` realtime, Zod, next-intl).

---

## Files Created
- `src/lib/validation/chat.ts`
- `src/actions/chat/index.ts`
- `src/app/[locale]/(protected)/chat/page.tsx`
- `src/app/[locale]/(protected)/chat/loading.tsx`
- `src/app/[locale]/(protected)/chat/[chatId]/page.tsx`
- `src/app/[locale]/(protected)/chat/[chatId]/loading.tsx`
- `src/components/chat/ChatThread.tsx`
- `tests/unit/actions/chat.test.ts`
- `tests/components/chat.test.tsx`

## Files Modified
- `src/lib/supabase/queries/chats.ts` – added `ChatWithPartner` type and `getChatListForUser()`
- `src/app/[locale]/(protected)/profile/[id]/page.tsx` – wired `startChat` Server Action
- `src/components/ui/NavBar.tsx` – added `/chat` nav link
- `messages/en.json` – added `chat.no_chats_hint`, `chat.send_failed`
- `messages/ar.json` – added `chat.no_chats_hint`, `chat.send_failed`
- `project_structure.md` – updated to reflect all new files and Phase 8 completion
