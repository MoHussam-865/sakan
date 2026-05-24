"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries/profiles";
import { emailSchema, otpSchema } from "@/lib/validation/auth";

// ---------------------------------------------------------------------------
// Shared result shapes
// ---------------------------------------------------------------------------

export type RequestOtpState = {
  success?: boolean;
  email?: string;
  error?: string;
  fieldError?: string;
};

export type VerifyOtpState = {
  error?: string;
};

// ---------------------------------------------------------------------------
// Request OTP
// ---------------------------------------------------------------------------

/**
 * Sends a 6-digit OTP to the provided email address via Supabase Auth.
 * Compatible with React's useActionState (prevState, formData).
 */
export async function requestOtp(
  _prevState: RequestOtpState,
  formData: FormData
): Promise<RequestOtpState> {
  const raw = { email: formData.get("email") };
  const parsed = emailSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = fieldErrors.email?.[0] ?? "email_invalid";
    return { fieldError: firstError };
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, email };
}

// ---------------------------------------------------------------------------
// Verify OTP
// ---------------------------------------------------------------------------

/**
 * Verifies the 6-digit OTP submitted by the user.
 * On success, redirects to /dashboard (returning user) or /onboarding (new user).
 * On failure, returns an error state for the form to display.
 */
export async function verifyOtp(
  _prevState: VerifyOtpState,
  formData: FormData
): Promise<VerifyOtpState> {
  const raw = {
    email: formData.get("email"),
    token: formData.get("token"),
  };

  const parsed = otpSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.token?.[0] ?? fieldErrors.email?.[0] ?? "otp_invalid";
    return { error: firstError };
  }

  const { email, token } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    return { error: "otp_invalid" };
  }

  // Determine post-auth destination: new users go to onboarding, returning users to dashboard.
  const locale = await getLocale();

  let profile = null;
  try {
    profile = await getProfileById(supabase, data.user.id);
  } catch {
    // RLS or network error – treat as new user to be safe
    profile = null;
  }

  if (profile) {
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/onboarding`);
  }
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

/**
 * Signs the current user out and redirects to the login page.
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect(`/${locale}/login`);
}
