import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChatById } from "@/lib/supabase/queries/chats";
import { getMessagesByChatId } from "@/lib/supabase/queries/messages";
import { getProfileById, getProfileIdByUserId } from "@/lib/supabase/queries/profiles";
import ChatThread from "@/components/chat/ChatThread";

interface ChatPageProps {
  params: Promise<{ locale: string; chatId: string }>;
}

export default async function ChatThreadPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  let currentProfileId: string | null = null;
  try {
    currentProfileId = await getProfileIdByUserId(supabase, user.id);
  } catch {
    notFound();
  }

  if (!currentProfileId) notFound();

  // Fetch chat, messages, and partner profile in parallel
  let chat: Awaited<ReturnType<typeof getChatById>> = null;
  try {
    chat = await getChatById(supabase, chatId);
  } catch {
    notFound();
  }

  if (!chat) notFound();

  // Authorization: caller must be a participant
  if (chat.user1_id !== currentProfileId && chat.user2_id !== currentProfileId) {
    notFound();
  }

  const partnerId =
    chat.user1_id === currentProfileId ? chat.user2_id : chat.user1_id;

  const [messages, partnerProfile] = await Promise.all([
    getMessagesByChatId(supabase, chatId).catch(() => []),
    getProfileById(supabase, partnerId).catch(() => null),
  ]);

  const partnerName = partnerProfile?.name ?? "—";

  return (
    <section className="flex flex-col h-[calc(100vh-3.5rem)] w-full max-w-2xl mx-auto">
      {/* Thread header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-zinc-200/60 bg-zinc-50 shrink-0">
        <Link
          href="/chat"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          aria-label={t("common.back")}
        >
          ←
        </Link>
        {/* Avatar placeholder */}
        <div
          className="w-9 h-9 rounded-full border-2 border-zinc-200/60 shrink-0"
          aria-hidden="true"
        />
        <h1 className="text-sm font-semibold text-zinc-900 truncate">
          {partnerName}
        </h1>
      </div>

      {/* Realtime chat thread */}
      <ChatThread
        chatId={chatId}
        initialMessages={messages}
        currentUserId={currentProfileId}
        partnerName={partnerName}
        tYou={t("chat.you")}
        tMessageHistory={t("chat.message_history")}
        tPlaceholder={t("chat.message_placeholder")}
        tSend={t("chat.send")}
        tSendFailed={t("chat.send_failed")}
      />
    </section>
  );
}
