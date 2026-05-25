import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Chat } from "@/types/supabase";

export type ChatWithPartner = Chat & {
  partner: { id: string; name: string };
};

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

/**
 * Returns all chats for the given user, enriched with the partner's profile
 * name. Performs a single batch profile lookup to avoid N+1 queries.
 */
export async function getChatListForUser(
  client: Client,
  userId: string
): Promise<ChatWithPartner[]> {
  const chats = await getChatsByUserId(client, userId);
  if (chats.length === 0) return [];

  const partnerIds = [
    ...new Set(
      chats.map((c) => (c.user1_id === userId ? c.user2_id : c.user1_id))
    ),
  ];

  const { data: profiles, error } = await client
    .from("profiles")
    .select("id, name")
    .in("id", partnerIds);

  if (error) throw error;

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p] as [string, { id: string; name: string }])
  );

  return chats.map((chat) => {
    const partnerId =
      chat.user1_id === userId ? chat.user2_id : chat.user1_id;
    const partner = profileMap.get(partnerId) ?? { id: partnerId, name: "—" };
    return { ...chat, partner };
  });
}
