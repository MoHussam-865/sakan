import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OtpForm from "@/components/auth/OtpForm";
import type { RequestOtpState, VerifyOtpState } from "@/actions/auth";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const map: Record<string, string> = {
      email_label: "Email address",
      email_placeholder: "you@example.com",
      otp_label: "One-time code",
      otp_placeholder: "123456",
      send_otp: "Send code",
      verify_otp: "Verify",
      resend_otp: "Resend code",
      otp_sent: `We sent a 6-digit code to ${params?.email ?? ""}`,
      otp_invalid: "Invalid or expired code. Try again.",
      email_required: "Email is required",
      email_invalid: "Enter a valid email address",
      otp_required: "Code is required",
      otp_length: "Code must be 6 digits",
    };
    return map[key] ?? key;
  },
}));

// Capture action call args so we can assert on them.
let mockRequestState: RequestOtpState = {};
let mockVerifyState: VerifyOtpState = {};

jest.mock("@/actions/auth", () => ({
  requestOtp: jest.fn(),
  verifyOtp: jest.fn(),
}));

// React's useActionState is not available in the test environment (jsdom).
// We stub it to immediately return the pre-set mock state and a no-op dispatch.
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useActionState: (
      action: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _initialState: unknown
    ): [unknown, (payload: FormData) => void, boolean] => {
      // Identify which action is being registered by its module reference.
      const { requestOtp, verifyOtp } = jest.requireMock("@/actions/auth");
      if (action === requestOtp) {
        return [mockRequestState, jest.fn(), false];
      }
      if (action === verifyOtp) {
        return [mockVerifyState, jest.fn(), false];
      }
      return [{}, jest.fn(), false];
    },
  };
});

jest.mock("@/lib/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function setup(
  requestState: RequestOtpState = {},
  verifyState: VerifyOtpState = {}
) {
  mockRequestState = requestState;
  mockVerifyState = verifyState;
  return render(<OtpForm />);
}

// ── Email step ─────────────────────────────────────────────────────────────

describe("OtpForm – email step", () => {
  beforeEach(() => {
    mockRequestState = {};
    mockVerifyState = {};
  });

  it("renders the email input and send button", () => {
    setup();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send code/i })).toBeInTheDocument();
  });

  it("does NOT render the OTP input initially", () => {
    setup();
    expect(screen.queryByLabelText("One-time code")).not.toBeInTheDocument();
  });

  it("shows a field error when email is invalid", () => {
    setup({ fieldError: "email_invalid" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address"
    );
  });

  it("shows an email_required error", () => {
    setup({ fieldError: "email_required" });
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
  });

  it("shows a generic error when requestOtp returns an error string", () => {
    setup({ error: "Rate limit exceeded" });
    expect(screen.getByRole("alert")).toHaveTextContent("Rate limit exceeded");
  });

  it("transitions to OTP step when requestOtp returns success", async () => {
    // Render with success state to trigger the useEffect transition.
    setup({ success: true, email: "user@example.com" });
    await waitFor(() => {
      expect(screen.getByLabelText("One-time code")).toBeInTheDocument();
    });
  });
});

// ── OTP step ───────────────────────────────────────────────────────────────

describe("OtpForm – OTP step", () => {
  beforeEach(() => {
    // Pre-set success state so the component renders in OTP step.
    mockRequestState = { success: true, email: "user@example.com" };
    mockVerifyState = {};
  });

  it("renders the OTP input and verify button", async () => {
    setup({ success: true, email: "user@example.com" });
    await waitFor(() => {
      expect(screen.getByLabelText("One-time code")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /verify/i })
      ).toBeInTheDocument();
    });
  });

  it("renders the resend button", async () => {
    setup({ success: true, email: "user@example.com" });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /resend code/i })
      ).toBeInTheDocument();
    });
  });

  it("shows the sent-to-email confirmation message", async () => {
    setup({ success: true, email: "user@example.com" });
    await waitFor(() => {
      expect(
        screen.getByText(/We sent a 6-digit code to user@example.com/)
      ).toBeInTheDocument();
    });
  });

  it("shows an OTP error when verifyOtp returns error", async () => {
    // Pass verifyState with error so the OTP step renders with the error message.
    setup({ success: true, email: "user@example.com" }, { error: "otp_invalid" });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid or expired code. Try again."
      );
    });
  });

  it("goes back to email step when resend is clicked", async () => {
    const user = userEvent.setup();
    setup({ success: true, email: "user@example.com" });
    await waitFor(() => {
      expect(screen.getByLabelText("One-time code")).toBeInTheDocument();
    });

    // Reset so EmailStep won't immediately transition back to OTP on re-mount.
    mockRequestState = {};
    await user.click(screen.getByRole("button", { name: /resend code/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.queryByLabelText("One-time code")).not.toBeInTheDocument();
    });
  });
});
