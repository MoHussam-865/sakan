import { getMessagesByChatId } from "@/lib/supabase/queries/messages";
import type { Message } from "@/types/supabase";

const messageFixture: Message = {
  id: "msg-1",
  chat_id: "chat-1",
  sender_id: "user-1",
  content: "Hello!",
  is_read: false,
  created_at: "2025-01-01T10:00:00Z",
};

function buildMockClient(result: { data: unknown; error: null | Error }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue(result),
  };
  return { from: jest.fn().mockReturnValue(chain) };
}

describe("getMessagesByChatId()", () => {
  it("returns messages in the chat", async () => {
    const mock = buildMockClient({ data: [messageFixture], error: null });
    const result = await getMessagesByChatId(
      mock as unknown as Parameters<typeof getMessagesByChatId>[0],
      "chat-1"
    );
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Hello!");
  });

  it("returns empty array when chat has no messages", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getMessagesByChatId(
      mock as unknown as Parameters<typeof getMessagesByChatId>[0],
      "chat-1"
    );
    expect(result).toEqual([]);
  });

  it("throws on Supabase error", async () => {
    const mock = buildMockClient({ data: null, error: new Error("DB error") });
    await expect(
      getMessagesByChatId(
        mock as unknown as Parameters<typeof getMessagesByChatId>[0],
        "chat-1"
      )
    ).rejects.toThrow("DB error");
  });
});
