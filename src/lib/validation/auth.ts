import { z } from "zod";

/**
 * Schema for the first OTP step: collect and validate the user's email address.
 */
export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, { message: "email_required" })
    .email({ message: "email_invalid" }),
});

/**
 * Schema for the second OTP step: verify the 6-digit one-time code.
 * Email is re-validated because it arrives as a hidden form field.
 */
export const otpSchema = z.object({
  email: z
    .string()
    .min(1, { message: "email_required" })
    .email({ message: "email_invalid" }),
  token: z
    .string()
    .min(1, { message: "otp_required" })
    .min(6, { message: "otp_length" })
    .max(6, { message: "otp_length" })
    .regex(/^\d{6}$/, { message: "otp_length" }),
});

export type EmailFormInput = z.infer<typeof emailSchema>;
export type OtpFormInput = z.infer<typeof otpSchema>;
