import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatThread from "@/components/chat/ChatThread";
import type { Message } from "@/types/supabase";

// ── Mocks ──────────────────────────────────────────────────────────────────

// jsdom does not implement scrollIntoView – provide a no-op so the
// auto-scroll effect in ChatThread does not throw.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// Mock Supabase browser client with a no-op realtime channel
jest.mock("@/lib/supabase/browser", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "token" } },
      }),
    },
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn(),
  })),
}));

jest.mock("@/actions/chat", () => ({
  sendMessage: jest.fn(),
}));

jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: unknown[]) =>
    args.filter((a) => typeof a === "string" && a).join(" "),
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const CURRENT_USER_ID = "user-me";
const OTHER_USER_ID = "user-other";
const CHAT_ID = "chat-abc";

const messages: Message[] = [
  {
    id: "msg-1",
    chat_id: CHAT_ID,
    sender_id: OTHER_USER_ID,
    content: "Hey there!",
    is_read: true,
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "msg-2",
    chat_id: CHAT_ID,
    sender_id: CURRENT_USER_ID,
    content: "Hello back!",
    is_read: true,
    created_at: "2026-01-01T10:01:00Z",
  },
];

const defaultProps = {
  chatId: CHAT_ID,
  initialMessages: messages,
  currentUserId: CURRENT_USER_ID,
  tYou: "You",
  tPlaceholder: "Write a message…",
  tSend: "Send",
  tSendFailed: "Failed to send. Please try again.",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function setup(props = defaultProps) {
  return render(<ChatThread {...props} />);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ChatThread – rendering", () => {
  it("renders all initial messages", () => {
    setup();
    expect(screen.getByText("Hey there!")).toBeInTheDocument();
    expect(screen.getByText("Hello back!")).toBeInTheDocument();
  });

  it("renders the message input and send button", () => {
    setup();
    expect(
      screen.getByPlaceholderText("Write a message…")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    setup();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("send button is enabled when input has text", () => {
    setup();
    const input = screen.getByPlaceholderText("Write a message…");
    fireEvent.change(input, { target: { value: "hi" } });
    expect(screen.getByRole("button", { name: /send/i })).not.toBeDisabled();
  });

  it("renders an empty message area when no initial messages", () => {
    setup({ ...defaultProps, initialMessages: [] });
    // No message bubbles, but input and button still present
    expect(screen.queryByText("Hey there!")).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a message…")
    ).toBeInTheDocument();
  });
});

describe("ChatThread – sending messages", () => {
  beforeEach(() => {
    const { sendMessage } = jest.requireMock("@/actions/chat");
    sendMessage.mockResolvedValue({ success: true });
  });

  afterEach(() => jest.clearAllMocks());

  it("clears the input after a successful send", async () => {
    setup();
    const input = screen.getByPlaceholderText("Write a message…");
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("shows the error message when send fails", async () => {
    const { sendMessage } = jest.requireMock("@/actions/chat");
    sendMessage.mockResolvedValue({ error: "send_failed" });

    setup();
    const input = screen.getByPlaceholderText("Write a message…");
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("alert")
      ).toHaveTextContent("Failed to send. Please try again.");
    });
  });

  it("restores input value when send fails", async () => {
    const { sendMessage } = jest.requireMock("@/actions/chat");
    sendMessage.mockResolvedValue({ error: "send_failed" });

    setup();
    const input = screen.getByPlaceholderText("Write a message…");
    fireEvent.change(input, { target: { value: "My message" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(input).toHaveValue("My message");
    });
  });

  it("does not send when input contains only whitespace", async () => {
    const { sendMessage } = jest.requireMock("@/actions/chat");

    setup();
    const input = screen.getByPlaceholderText("Write a message…");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    // Button remains disabled for whitespace-only input
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
