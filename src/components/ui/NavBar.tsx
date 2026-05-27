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

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className={cn(
        "text-sm transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50",
        pathname === href
          ? "text-zinc-900 font-medium"
          : "text-zinc-500 hover:text-zinc-900"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-10 bg-zinc-50/90 backdrop-blur-sm border-b border-zinc-200/60"
      aria-label={tNav("main_navigation")}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="font-semibold text-zinc-900 text-sm tracking-tight rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
        >
          {tCommon("app_name")}
        </Link>

        {/* Nav links + sign out */}
        <div className="flex items-center gap-6">
          {navLink("/dashboard", tNav("dashboard"))}
          {navLink("/chat", tNav("chat"))}
          {navLink("/preferences", tNav("preferences"))}

          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
            >
              {tNav("sign_out")}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
