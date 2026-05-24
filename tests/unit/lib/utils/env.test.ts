/**
 * env.ts is not unit-testable in isolation because it calls requireEnv()
 * at module evaluation time, throwing when variables are absent.
 * These tests verify the behaviour by controlling process.env.
 */

describe("env loader", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("exports supabase.url and supabase.anonKey when both vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const { env } = await import("@/lib/utils/env");

    expect(env.supabase.url).toBe("https://test.supabase.co");
    expect(env.supabase.anonKey).toBe("test-anon-key");
  });

  it("defaults app.url to localhost:3000 when NEXT_PUBLIC_APP_URL is not set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    delete process.env.NEXT_PUBLIC_APP_URL;

    const { env } = await import("@/lib/utils/env");

    expect(env.app.url).toBe("http://localhost:3000");
  });

  it("uses NEXT_PUBLIC_APP_URL when provided", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "https://sakan.example.com";

    const { env } = await import("@/lib/utils/env");

    expect(env.app.url).toBe("https://sakan.example.com");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    await expect(import("@/lib/utils/env")).rejects.toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  });

  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(import("@/lib/utils/env")).rejects.toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  });
});
