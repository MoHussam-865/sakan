import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"] as const,
  defaultLocale: "en",
  // localeDetection: true is the default – uses the Accept-Language header and
  // a locale cookie so the user gets their browser-preferred language on first visit.
});

export type Locale = (typeof routing.locales)[number];
