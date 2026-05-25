import { startChat, sendMessage } from "@/actions/chat";
import { getProfileIdByUserId } from "@/lib/supabase/queries/profiles";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("next-intl/server", () => ({
  getLocale: jest.fn().mockResolvedValue("en"),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

jest.mock("@/lib/supabase/queries/profiles", () => ({
  getProfileIdByUserId: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-var
var mockFrom: jest.Mock;
// eslint-disable-next-line no-var
var mockGetUser: jest.Mock;

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockImplementation(async () => ({
    auth: { getUser: (...args: any[]) => mockGetUser(...args) },
    from: (...args: any[]) => mockFrom(...args),
  })),
}));

beforeEach(() => {
  mockFrom = jest.fn();
  mockGetUser = jest.fn();
});

afterEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CURRENT_USER = { id: "user-a" };
const CURRENT_PROFILE_ID = "profile-a";
const OTHER_USER_ID = "user-b";
const CHAT_ID = "chat-uuid-123";

const mockGetProfileIdByUserId =
  getProfileIdByUserId as jest.MockedFunction<typeof getProfileIdByUserId>;

function makeFormData(): FormData {
  return new FormData();
}

function buildChain(overrides: Partial<{
  maybeSingle: jest.Mock;
  single: jest.Mock;
  insert: jest.Mock;
}> = {}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  // make fluent methods return the chain
  chain.select.mockReturnThis();
  chain.eq.mockReturnThis();
  chain.or.mockReturnThis();
  if (!overrides.insert) {
    chain.insert = jest.fn().mockReturnValue(chain);
  }
  return chain;
}

// ---------------------------------------------------------------------------
// startChat()
// ---------------------------------------------------------------------------

describe("startChat()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: CURRENT_USER },
      error: null,
    });
    mockGetProfileIdByUserId.mockResolvedValue(CURRENT_PROFILE_ID);
  });

  it("redirects to the existing chat when one already exists", async () => {
    const chain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: CHAT_ID },
        error: null,
      }),
    });
    mockFrom.mockReturnValue(chain);

    await expect(startChat(OTHER_USER_ID, makeFormData())).rejects.toThrow(
      `REDIRECT:/en/chat/${CHAT_ID}`
    );
  });

  it("creates a new chat and redirects when none exists", async () => {
    let callCount = 0;
    const insertChain = buildChain({
      single: jest.fn().mockResolvedValue({
        data: { id: CHAT_ID },
        error: null,
      }),
    });
    // First call: .maybeSingle() returns null (no existing chat)
    // Second call: insert chain
    const lookupChain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    mockFrom.mockImplementation(() => {
      callCount += 1;
      return callCount === 1 ? lookupChain : insertChain;
    });

    await expect(startChat(OTHER_USER_ID, makeFormData())).rejects.toThrow(
      `REDIRECT:/en/chat/${CHAT_ID}`
    );
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(startChat(OTHER_USER_ID, makeFormData())).rejects.toThrow(
      "auth_required"
    );
  });

  it("returns invalid_request when trying to chat with self", async () => {
    mockGetProfileIdByUserId.mockResolvedValue(OTHER_USER_ID);
    await expect(startChat(OTHER_USER_ID, makeFormData())).rejects.toThrow(
      "invalid_request"
    );
  });

  it("returns start_failed when lookup throws", async () => {
    const chain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: new Error("DB error"),
      }),
    });
    mockFrom.mockReturnValue(chain);
    await expect(startChat(OTHER_USER_ID, makeFormData())).rejects.toThrow(
      "start_failed"
    );
  });
});

// ---------------------------------------------------------------------------
// sendMessage()
// ---------------------------------------------------------------------------

describe("sendMessage()", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: CURRENT_USER },
      error: null,
    });
    mockGetProfileIdByUserId.mockResolvedValue(CURRENT_PROFILE_ID);
  });

  it("returns success when message is inserted", async () => {
    let callCount = 0;
    const participantChain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: CHAT_ID },
        error: null,
      }),
    });
    const insertChain = {
      ...buildChain(),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    mockFrom.mockImplementation(() => {
      callCount += 1;
      // first call is participant check, second is insert
      return callCount === 1 ? participantChain : insertChain;
    });

    const result = await sendMessage(CHAT_ID, "Hello there");
    expect(result.success).toBe(true);
  });

  it("returns content_required for empty content", async () => {
    const result = await sendMessage(CHAT_ID, "   ");
    expect(result.error).toBe("content_required");
  });

  it("returns content_required for content exceeding 1000 chars", async () => {
    const result = await sendMessage(CHAT_ID, "a".repeat(1001));
    expect(result.error).toBe("content_required");
  });

  it("returns auth_required when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await sendMessage(CHAT_ID, "Hello");
    expect(result.error).toBe("auth_required");
  });

  it("returns unauthorized when user is not a chat participant", async () => {
    const chain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
    mockFrom.mockReturnValue(chain);
    const result = await sendMessage(CHAT_ID, "Hello");
    expect(result.error).toBe("unauthorized");
  });

  it("returns send_failed when insert errors", async () => {
    let callCount = 0;
    const participantChain = buildChain({
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: CHAT_ID },
        error: null,
      }),
    });
    const insertChain = {
      ...buildChain(),
      insert: jest
        .fn()
        .mockResolvedValue({ error: new Error("insert error") }),
    };
    mockFrom.mockImplementation(() => {
      callCount += 1;
      return callCount === 1 ? participantChain : insertChain;
    });

    const result = await sendMessage(CHAT_ID, "Hello");
    expect(result.error).toBe("send_failed");
  });
});
