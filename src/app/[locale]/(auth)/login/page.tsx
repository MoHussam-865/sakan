import { getTranslations } from "next-intl/server";
import OtpForm from "@/components/auth/OtpForm";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <section className="w-full max-w-sm flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {t("title")}
        </h1>
        <p className="text-sm text-zinc-500">{t("subtitle")}</p>
      </div>
      <OtpForm />
    </section>
  );
}
