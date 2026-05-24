# Phase 6.1 (Hotfix) - Accessible UI Refactor

## Why?
Critical UX issue regarding color contrast (dark text on pitch-black background) and departure from "Premium, Editorial Minimalist" design.

## What?
- Updated Authentication Layout and Login pages to use `bg-stone-50` with high-contrast text and a white card for forms (`bg-white shadow-sm border border-slate-100`).
- Replaced `stone-*` text and background colors with `slate-*` to match strict brand guidelines.
- Standardized inputs and buttons to use exactly prescribed modern Tailwind styling (e.g., `px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900 focus:ring-slate-900`).
- Applied layout and styling fixes to Onboarding screens (`Step1Form`, `Step2Form`, `Step3Form`, `Step4Form`, `StepProgressBar`, `OnboardingWizard`, etc.) to adhere strictly to the light theme.
- Updated `docs/instructions.md` with explicit UI rules to ensure future agents maintain this exact aesthetic.
