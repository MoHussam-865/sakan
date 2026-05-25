import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChatListForUser } from "@/lib/supabase/queries/chats";
import { getProfileIdByUserId } from "@/lib/supabase/queries/profiles";
import type { ChatWithPartner } from "@/lib/supabase/queries/chats";

export default async function ChatListPage() {
  const t = await getTranslations();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let chats: ChatWithPartner[] = [];
  if (user) {
    try {
      const profileId = await getProfileIdByUserId(supabase, user.id);
      if (profileId) {
        chats = await getChatListForUser(supabase, profileId);
      }
    } catch {
      // Fail silently – empty state is shown below
    }
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-10">
      {/* Page heading */}
      <div className="pb-6 mb-2 border-b border-slate-200">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("chat.title")}
        </h1>
      </div>

      {chats.length === 0 ? (
        /* Empty state */
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-slate-500 text-xl">💬</span>
          </div>
          <p className="text-slate-900 font-medium">{t("chat.no_chats")}</p>
          <p className="text-sm text-slate-500">{t("chat.no_chats_hint")}</p>
          <Link
            href="/dashboard"
            className="mt-2 text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            {t("dashboard.title")}
          </Link>
        </div>
      ) : (
        /* Chat list */
        <ul className="divide-y divide-slate-100" aria-label={t("chat.title")}>
          {chats.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/chat/${chat.id}`}
                className="flex items-center gap-4 py-4 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {/* Avatar placeholder */}
                <div
                  className="w-10 h-10 rounded-full border-2 border-slate-200 shrink-0"
                  aria-hidden="true"
                />
                {/* Name */}
                <span className="flex-1 text-slate-900 font-medium text-sm truncate">
                  {chat.partner.name}
                </span>
                {/* Chevron */}
                <span className="text-slate-500 text-sm" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
