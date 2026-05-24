import { emailSchema, otpSchema } from "@/lib/validation/auth";

describe("emailSchema", () => {
  it("accepts a valid email address", () => {
    const result = emailSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("trims whitespace and lowercases the email", () => {
    const result = emailSchema.safeParse({ email: "  User@EXAMPLE.COM  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects an empty string with email_required message key", () => {
    const result = emailSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.email ?? [];
      expect(errors).toContain("email_required");
    }
  });

  it("rejects a string without a TLD as invalid", () => {
    const result = emailSchema.safeParse({ email: "notanemail" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.email ?? [];
      expect(errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects a string missing the @ symbol", () => {
    const result = emailSchema.safeParse({ email: "userexample.com" });
    expect(result.success).toBe(false);
  });
});

describe("otpSchema", () => {
  it("accepts a valid email and 6-digit token", () => {
    const result = otpSchema.safeParse({
      email: "user@example.com",
      token: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty token with otp_required key", () => {
    const result = otpSchema.safeParse({
      email: "user@example.com",
      token: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.token ?? [];
      expect(errors).toContain("otp_required");
    }
  });

  it("rejects a token shorter than 6 digits", () => {
    const result = otpSchema.safeParse({
      email: "user@example.com",
      token: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.token ?? [];
      expect(errors).toContain("otp_length");
    }
  });

  it("rejects a token longer than 6 digits", () => {
    const result = otpSchema.safeParse({
      email: "user@example.com",
      token: "1234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.token ?? [];
      expect(errors).toContain("otp_length");
    }
  });

  it("rejects a non-numeric 6-character token", () => {
    const result = otpSchema.safeParse({
      email: "user@example.com",
      token: "abc123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.token ?? [];
      expect(errors).toContain("otp_length");
    }
  });

  it("rejects an invalid email in the token step", () => {
    const result = otpSchema.safeParse({
      email: "bademail",
      token: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.email ?? [];
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});
