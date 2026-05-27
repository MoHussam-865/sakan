"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { sendMessage } from "@/actions/chat";
import { cn } from "@/lib/utils/cn";
import type { Message } from "@/types/supabase";

interface ChatThreadProps {
  chatId: string;
  initialMessages: Message[];
  currentUserId: string;
  partnerName: string;
  /** i18n strings passed from the Server Component parent */
  tYou: string;
  tMessageHistory: string;
  tPlaceholder: string;
  tSend: string;
  tSendFailed: string;
}

/**
 * Client Component: renders the scrollable message list and the send input.
 * Subscribes to Supabase Realtime `postgres_changes` on the messages table
 * so that incoming messages from the other participant appear instantly.
 *
 * Outgoing messages are added optimistically on send; the realtime handler
 * only adds messages from the other participant to avoid duplication.
 */
export default function ChatThread({
  chatId,
  initialMessages,
  currentUserId,
  partnerName,
  tYou,
  tMessageHistory,
  tPlaceholder,
  tSend,
  tSendFailed,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const clearRetry = () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const scheduleRetry = () => {
      if (disposed || retryTimer) return;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void subscribeToChanges();
      }, 1200);
    };

    const subscribeToChanges = async () => {
      if (disposed) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Session hydration can lag right after navigation.
        // Retry so the channel joins with the authenticated token.
        scheduleRetry();
        return;
      }

      channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            const incoming = payload.new as Message;
            // Only handle messages from the other participant;
            // the sender's own messages are added optimistically.
            if (incoming.sender_id === currentUserId) return;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          }
        )
        .subscribe((status) => {
          if (disposed) return;
          if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
            if (channel) {
              void supabase.removeChannel(channel);
              channel = null;
            }
            scheduleRetry();
          }
        });
    };

    void subscribeToChanges();

    return () => {
      disposed = true;
      clearRetry();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send handler ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setInputValue("");

    const result = await sendMessage(chatId, content);

    if (result?.error) {
      setError(tSendFailed);
      setInputValue(content); // restore on failure
    } else {
      // Optimistic insertion so the sender sees their own message immediately
      setMessages((prev) => [
        ...prev,
        {
          id: `opt-${Date.now()}`,
          chat_id: chatId,
          sender_id: currentUserId,
          content,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setIsSubmitting(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable message list */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
        aria-live="polite"
        aria-label={tMessageHistory}
      >
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words",
                  isOwn
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                    : "bg-white bg-gradient-to-br from-white to-zinc-50/50 border border-zinc-200/50 text-zinc-900"
                )}
                dir="auto"
              >
                <span className="sr-only">
                  {isOwn ? `${tYou}: ` : `${partnerName}: `}
                </span>
                <span>{msg.content}</span>
              </div>
            </div>
          );
        })}
        {/* Sentinel element for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Error feedback */}
      {error && (
        <p role="alert" className="px-4 pb-1 text-sm text-zinc-500">
          {error}
        </p>
      )}

      {/* Message input bar */}
      <div className="border-t border-zinc-200/50 bg-white bg-gradient-to-br from-white to-zinc-50/50 px-4 py-3">
        <div className="flex gap-2 items-center">
          <label htmlFor="chat-input" className="sr-only">
            {tPlaceholder}
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tPlaceholder}
            disabled={isSubmitting}
            autoComplete="off"
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200/50 bg-white bg-gradient-to-br from-white to-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-offset-2 transition-all text-sm disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSubmitting || !inputValue.trim()}
            aria-label={tSend}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-sm hover:from-emerald-500 hover:to-teal-400 hover:shadow-md hover:shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {tSend}
          </button>
        </div>
      </div>
    </div>
  );
}
