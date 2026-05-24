# 🤖 AI Agent Coding Guidelines (agent_instructions.md)

You are an expert full-stack developer assistant specializing in Next.js (App Router), TypeScript, Tailwind CSS, and Supabase. Whenever you generate, modify, or refactor code for this project, you must strictly adhere to the following architectural, structural, and quality guidelines.

## 1. Architecture: Next.js App Router & Supabase
We use the modern Next.js App Router (`src/app`). You must maintain a strict separation of environments and concerns:
* **Server Components (Default):** Use Server Components for data fetching from Supabase, SEO metadata, and passing initial data down as props. Keep them async.
* **Client Components (`"use client"`):** Use Client Components ONLY when necessary (e.g., state hooks, event listeners, browser APIs). Keep them as low in the component tree as possible.
* **Mutations (Server Actions):** All database writes, updates, and deletes must be handled via Next.js Server Actions (`"use server"`). Do not write direct Supabase mutation calls inside Client Components.
* **Validation:** Use `Zod` to validate all incoming data in Server Actions and for frontend form validation (e.g., with `react-hook-form`).

## 2. Internationalization (i18n) & Localization
The app must support multiple languages (Arabic/English) from day one.
* **No Hardcoded Strings:** Absolutely no hardcoded text in the UI (e.g., `<div>Hello</div>`).
* **JSON Dictionaries:** All user-facing strings must be extracted to dictionary files (e.g., `messages/en.json`, `messages/ar.json`).
* **Implementation:** Use `next-intl` (or the specified i18n package). Fetch strings in Server Components and pass them down, or use the `useTranslations` hook in Client Components.

## 3. Testing Requirements (MANDATORY)
Code is NEVER considered complete without tests. You MUST generate or update tests for every new feature, modification, or bug fix you write:
* **Unit Tests:** Write Jest tests for all utility functions, Zod schemas, and Server Actions. Mock Supabase responses using appropriate mocking libraries.
* **Component Tests:** Write React Testing Library (RTL) tests for complex UI components to verify they render correctly, handle user interactions, and display the right localizations.

## 4. Code Quality & TypeScript Practices
* **Strict TypeScript:** NO `any` types. Define strict interfaces or types for all component props, Supabase responses, and state objects. Generate and use Supabase TypeScript types.
* **DRY (Don't Repeat Yourself):** Extract repetitive UI elements into reusable components in `src/components`. Extract repetitive logic into custom React hooks or utility functions in `src/lib`.
* **Error Handling:** Never swallow exceptions. Wrap Server Actions in `try/catch` blocks and return standardized objects (e.g., `{ success: false, error: "message" }`). Use Next.js `error.tsx` boundaries to gracefully catch rendering errors.
* **Linting:** Ensure code complies with ESLint and Prettier rules. Fix all warnings before completing a task.

## 5. ANTI-AI UI/UX & Premium Styling (CRITICAL)
Avoid the generic, templated "AI-generated look". We are building a premium, editorial minimalist platform.
* **Tailwind CSS:** Use Tailwind utility classes. For complex conditional classes, use `clsx` and `tailwind-merge` (the `cn()` utility pattern).
* **Accessible Warmth Palette:** Rely on warm neutral palettes. 
  * Backgrounds: `bg-[#FAFAFA]` or `bg-stone-50` for pages.
  * Cards/Forms: `bg-white`, very subtle borders (`border-slate-100` or `border-slate-200`), and `shadow-sm`. Do NOT use pitch-black backgrounds.
  * Typography: `text-slate-900` for high-contrast primary text, `text-slate-500` for secondary text/labels. NEVER use low-contrast text on pitch-black for forms!
  * Inputs: Consistent, pristine styling like `w-full px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all`.
  * Buttons: Solid, premium action blocks like `bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors`.
* **Container-less Grouping:** Group related elements using generous whitespace and ultra-thin, subtle dividers instead of heavy boxed cards (`shadow-lg`). Remove overly thick borders.
* **Micro-interactions:** Add subtle hover states (`hover:bg-slate-50 transition-colors`), custom slim scrollbars, and fluid state changes.

## 6. Web Specifics & Accessibility
* **Responsive Layouts:** Design mobile-first. Use Tailwind breakpoints (`sm:`, `md:`, `lg:`) to scale layouts smoothly to desktop. Avoid fixed widths that break on smaller screens.
* **Accessibility (a11y):** Use semantic HTML (`<main>`, `<section>`, `<nav>`, `<form>`). Ensure all interactive elements are keyboard navigable. Use `aria-` attributes where native HTML falls short.

## 7. Workflow & Git Commits
Whenever you finish generating code for a task, you must provide a ready-to-use Git commit message for me to review.
* **CRITICAL:** Do NOT execute any `git` commands yourself, and do NOT output the `git commit` terminal command. Only provide the raw text of the commit message.
* **Provide a Summary:** Briefly list the files created, modified, or deleted.
* **Provide the Commit Message:** Output a code block containing just the raw message text. Use the Conventional Commits format.
  * *Example:*
    ```text
    feat: implement Phase 2 – app skeleton and route topology

    Added next-intl routing, middleware, i18n request config, locale layout with html lang/dir, route groups (auth/onboarding/protected), skeleton pages, error boundaries, loading states, not-found pages, and 11 new tests.
    ```

## 8. Self-Correction & Error Checking (CRITICAL)
Before you declare a task finished and provide the Git commit message, you MUST perform a final quality check to ensure no leftover errors:
* **Build Check (MANDATORY):** You must run `npm run build` to verify the Next.js production build succeeds. This guarantees there are no hidden type errors, missing keys, or broken server/client boundaries. 
* **Directives:** Ensure `"use client"` or `"use server"` are at the very top of the file where required.
* **Missing Imports:** Double-check that all components, hooks, and types are properly imported.
* **Hydration Mismatches:** Ensure Client Components don't render data that differs from the server render.
* **Static Analysis:** Run `npm run lint` and `npx tsc --noEmit` to confirm there are no static errors.

## 9. Project Structure Maintenance (MANDATORY)
To maintain a pristine repository architecture, you MUST create or update a root file named `project_structure.md` whenever you introduce new folders or files.
* **Visual Tree:** Maintain a clean visual directory tree mapping out the `src/` structure (e.g., `app/`, `components/`, `lib/`, `actions/`).
* **File Brief Notes:** For every single file listed in the tree, you must include a brief, one-sentence note explaining its precise purpose.
* **Keep it Sync:** This file must be updated in tandem with your code changes *before* delivering the final task summary.

## 10. Incremental Documentation (MANDATORY)
Whenever you complete a task, you must generate a progressive summary file inside the `docs/` folder to act as a changelog.
* **Numbering System:** Look at the existing files in the `docs/` directory. Find the file with the highest numeric prefix (e.g., if you see `1_foundation.md` and `2_app_skeleton.md`, the highest number is 2).
* **Next File:** Increment that highest number by 1 and create a new markdown file (e.g., `3_new_feature_name.md`).
* **Content:** Inside this new file, write a clear, concise summary of the features implemented, architectural decisions made, and any new dependencies added during your current task.