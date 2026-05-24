import { getTranslations } from "next-intl/server";
import OtpForm from "@/components/auth/OtpForm";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <section className="w-full max-w-sm flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
          {t("title")}
        </h1>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>
      <OtpForm />
    </section>
  );
}
