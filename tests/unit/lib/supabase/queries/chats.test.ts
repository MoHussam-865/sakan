import { getChatsByUserId, getChatById } from "@/lib/supabase/queries/chats";
import type { Chat } from "@/types/supabase";

const chatFixture: Chat = {
  id: "chat-1",
  user1_id: "user-1",
  user2_id: "user-2",
  created_at: "2025-01-01T00:00:00Z",
};

function buildMockClient(result: { data: unknown; error: null | Error }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  return { from: jest.fn().mockReturnValue(chain) };
}

describe("getChatsByUserId()", () => {
  it("returns chats for the user", async () => {
    const mock = buildMockClient({ data: [chatFixture], error: null });
    const result = await getChatsByUserId(
      mock as unknown as Parameters<typeof getChatsByUserId>[0],
      "user-1"
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("chat-1");
  });

  it("returns empty array when user has no chats", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getChatsByUserId(
      mock as unknown as Parameters<typeof getChatsByUserId>[0],
      "user-1"
    );
    expect(result).toEqual([]);
  });

  it("throws on Supabase error", async () => {
    const mock = buildMockClient({ data: null, error: new Error("DB error") });
    await expect(
      getChatsByUserId(
        mock as unknown as Parameters<typeof getChatsByUserId>[0],
        "user-1"
      )
    ).rejects.toThrow("DB error");
  });
});

describe("getChatById()", () => {
  it("returns the chat when found", async () => {
    const mock = buildMockClient({ data: chatFixture, error: null });
    const result = await getChatById(
      mock as unknown as Parameters<typeof getChatById>[0],
      "chat-1"
    );
    expect(result).toEqual(chatFixture);
  });

  it("returns null when not found", async () => {
    const mock = buildMockClient({ data: null, error: null });
    const result = await getChatById(
      mock as unknown as Parameters<typeof getChatById>[0],
      "nonexistent"
    );
    expect(result).toBeNull();
  });
});
