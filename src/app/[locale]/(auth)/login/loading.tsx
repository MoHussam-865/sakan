import { getTranslations } from "next-intl/server";

export default async function LoginLoading() {
  const tCommon = await getTranslations("common");

  return (
    <div
      className="flex-1 flex items-center justify-center"
      role="status"
      aria-label={tCommon("loading")}
    >
      <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
    </div>
  );
}
