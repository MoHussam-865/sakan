"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * Locale toggle rendered as "EN | عربي".
 * Navigates to the same page path in the selected locale via next-intl Link.
 */
export default function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("locale_switcher");

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center gap-0" role="list">
        {routing.locales.map((locale, i) => {
          const isActive = locale === currentLocale;
          return (
            <li key={locale} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-2 text-zinc-300 select-none"
                  aria-hidden="true"
                >
                  |
                </span>
              )}
              <Link
                href={pathname}
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-xs font-medium tracking-wide uppercase transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50",
                  isActive
                    ? "text-zinc-900 cursor-default pointer-events-none"
                    : "text-zinc-500 hover:text-indigo-700 hover:shadow-md hover:shadow-indigo-500/10 transition-all"
                )}
              >
                {t(locale)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
