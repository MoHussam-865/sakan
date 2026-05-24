"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

// Error boundaries must be Client Components (Next.js requirement).
// Uses `unstable_retry` – the Next.js 16 rename of the former `reset` prop.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Forward to your error-reporting service in production.
    console.error(error);
  }, [error]);

  const t = useTranslations("common");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold text-slate-800">{t("error_title")}</h1>
      <button
        type="button"
        onClick={unstable_retry}
        className="px-5 py-2 text-sm font-medium text-slate-700 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {t("error_retry")}
      </button>
    </main>
  );
}
