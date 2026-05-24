import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/app/[locale]/error";

// Mock next-intl – the error boundary is a client component that uses useTranslations.
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      error_title: "Something went wrong",
      error_retry: "Try again",
    };
    return map[key] ?? key;
  },
}));

describe("Error boundary (<locale>/error.tsx)", () => {
  const testError = new Error("Test error");
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the error title", () => {
    render(<ErrorBoundary error={testError} unstable_retry={mockRetry} />);
    expect(screen.getByRole("heading")).toHaveTextContent("Something went wrong");
  });

  it("renders the retry button", () => {
    render(<ErrorBoundary error={testError} unstable_retry={mockRetry} />);
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it("calls unstable_retry when the retry button is clicked", () => {
    render(<ErrorBoundary error={testError} unstable_retry={mockRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("logs the error to console on mount", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorBoundary error={testError} unstable_retry={mockRetry} />);
    expect(consoleSpy).toHaveBeenCalledWith(testError);
  });
});
