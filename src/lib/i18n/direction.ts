import type { Locale } from "@/i18n/routing";

// Locales that use right-to-left text direction.
const RTL_LOCALES: readonly string[] = ["ar"];

/**
 * Returns the CSS text direction for the given locale.
 * Defaults to "ltr" for any unrecognised locale.
 */
export function getLocaleDir(locale: Locale | string): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
