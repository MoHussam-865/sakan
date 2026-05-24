import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Chat } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Returns all chats the current user participates in,
 * ordered by creation date descending (most recent first).
 * RLS ensures only the user's own chats are returned.
 */
export async function getChatsByUserId(
  client: Client,
  userId: string
): Promise<Chat[]> {
  const { data, error } = await client
    .from("chats")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetches a single chat room by its UUID.
 * Returns null when the chat does not exist or the caller lacks access.
 */
export async function getChatById(
  client: Client,
  chatId: string
): Promise<Chat | null> {
  const { data, error } = await client
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
