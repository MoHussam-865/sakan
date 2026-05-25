"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validation/chat";

// ---------------------------------------------------------------------------
// Shared result type
// ---------------------------------------------------------------------------

export type ChatActionResult = {
  success?: boolean;
  error?: string;
};

// ---------------------------------------------------------------------------
// startChat
// ---------------------------------------------------------------------------

/**
 * Finds or creates a private chat room between the authenticated user and
 * `otherUserId`, then redirects to the chat thread page.
 *
 * Designed to be bound in a Server Component and used as a `<form>` action:
 *   const action = startChat.bind(null, profile.id);
 *   <form action={action}><button type="submit">…</button></form>
 *
 * On fatal error the function throws, which is caught by the nearest
 * `error.tsx` boundary.
 */
export async function startChat(
  otherUserId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("auth_required");

  // Guard: cannot chat with yourself
  if (user.id === otherUserId) throw new Error("invalid_request");

  // Check for an existing chat room (direction-agnostic)
  const { data: existing, error: lookupError } = await supabase
    .from("chats")
    .select("id")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .maybeSingle();

  if (lookupError) throw new Error("start_failed");

  let chatId: string;

  if (existing) {
    chatId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from("chats")
      .insert({ user1_id: user.id, user2_id: otherUserId })
      .select("id")
      .single();

    if (createError || !created) throw new Error("start_failed");
    chatId = created.id;
  }

  const locale = await getLocale();
  redirect(`/${locale}/chat/${chatId}`);
}

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------

/**
 * Validates and persists a new message to the given chat room.
 * The caller must be a participant of the chat (enforced both by RLS and the
 * explicit participant check below).
 */
export async function sendMessage(
  chatId: string,
  content: string
): Promise<ChatActionResult> {
  const parsed = sendMessageSchema.safeParse({ content });
  if (!parsed.success) return { error: "content_required" };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "auth_required" };

  // Verify the caller is a participant to prevent unauthorised writes
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .maybeSingle();

  if (chatError || !chat) return { error: "unauthorized" };

  const { error: msgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: user.id,
    content: parsed.data.content,
  });

  if (msgError) return { error: "send_failed" };
  return { success: true };
}
