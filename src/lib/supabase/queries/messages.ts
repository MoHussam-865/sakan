import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Message } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Returns all messages in a chat room ordered chronologically (oldest first).
 * RLS ensures the caller is a participant of the chat.
 */
export async function getMessagesByChatId(
  client: Client,
  chatId: string
): Promise<Message[]> {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
