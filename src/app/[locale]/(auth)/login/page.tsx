import { getTranslations } from "next-intl/server";
import OtpForm from "@/components/auth/OtpForm";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <section className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500">{t("subtitle")}</p>
      </div>
      <OtpForm />
    </section>
  );
}
