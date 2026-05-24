import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getLocaleDir } from "@/lib/i18n/direction";
import { cn } from "@/lib/utils/cn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sakan",
    default: "Sakan | \u0633\u0643\u0646",
  },
  description: "Premium matchmaking platform",
};

// Pre-generates static route params for all supported locales at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Guard against unknown locale segments (e.g. /unknown/page).
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = getLocaleDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={cn(geistSans.variable, "h-full antialiased")}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
