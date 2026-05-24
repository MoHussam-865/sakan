import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Fallback for the root path.
// In normal flow the next-intl middleware intercepts "/" and redirects to
// "/{detected-locale}" before this page renders. This export exists as a
// safety net for edge cases where the middleware is bypassed.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
