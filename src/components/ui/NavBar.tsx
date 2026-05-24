"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

/**
 * Sticky top navigation bar rendered inside all protected routes.
 * Active link detection is handled via next-intl's usePathname (no locale prefix).
 */
export default function NavBar() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100"
      aria-label="Main navigation"
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="font-semibold text-slate-900 text-sm tracking-tight"
        >
          {tCommon("app_name")}
        </Link>

        {/* Nav links + sign out */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={cn(
              "text-sm transition-colors",
              pathname === "/dashboard"
                ? "text-slate-900 font-medium"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {tNav("dashboard")}
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              {tNav("sign_out")}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
