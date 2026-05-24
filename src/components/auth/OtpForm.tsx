"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { requestOtp, verifyOtp } from "@/actions/auth";
import type { RequestOtpState, VerifyOtpState } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "email" | "otp";

// ---------------------------------------------------------------------------
// Shared input primitive
// ---------------------------------------------------------------------------

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-slate-500">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email step
// ---------------------------------------------------------------------------

function EmailStep({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const t = useTranslations("auth");

  const [state, action, isPending] = useActionState<RequestOtpState, FormData>(
    requestOtp,
    {}
  );

  useEffect(() => {
    if (state.success && state.email) {
      onSuccess(state.email);
    }
  }, [state.success, state.email, onSuccess]);

  return (
    <form action={action} noValidate className="flex flex-col gap-5 w-full">
      <Field
        id="email"
        label={t("email_label")}
        error={state.fieldError ? t(state.fieldError as Parameters<typeof t>[0]) : undefined}
      >
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          inputMode="email"
          placeholder={t("email_placeholder")}
          aria-describedby={state.fieldError ? "email-error" : undefined}
          aria-invalid={!!state.fieldError}
          disabled={isPending}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900",
            "placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            state.fieldError && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 mt-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? t("send_otp") + "…" : t("send_otp")}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// OTP step
// ---------------------------------------------------------------------------

function OtpStep({
  email,
  onResend,
}: {
  email: string;
  onResend: () => void;
}) {
  const t = useTranslations("auth");

  const [state, action, isPending] = useActionState<VerifyOtpState, FormData>(
    verifyOtp,
    {}
  );

  // Auto-focus the OTP input when this step mounts
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Interpolate email into the "sent" message
  const sentMessage = t("otp_sent", { email });

  return (
    <form action={action} noValidate className="flex flex-col gap-5 w-full">
      {/* Hidden email so the server action has it */}
      <input type="hidden" name="email" value={email} />

      <p className="text-sm text-slate-500">{sentMessage}</p>

      <Field
        id="token"
        label={t("otp_label")}
        error={state.error ? t(state.error as Parameters<typeof t>[0]) : undefined}
      >
        <input
          ref={inputRef}
          id="token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder={t("otp_placeholder")}
          aria-describedby={state.error ? "token-error" : undefined}
          aria-invalid={!!state.error}
          disabled={isPending}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-slate-200 bg-transparent text-slate-900 tracking-widest",
            "placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            state.error && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 mt-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? t("verify_otp") + "…" : t("verify_otp")}
      </button>

      <button
        type="button"
        onClick={onResend}
        disabled={isPending}
        className={cn(
          "text-sm text-slate-500 underline-offset-4 hover:underline hover:text-slate-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-150"
        )}
      >
        {t("resend_otp")}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Composed OtpForm
// ---------------------------------------------------------------------------

/**
 * Two-step auth form: email collection → OTP verification.
 * Manages the step state locally; delegates mutations to Server Actions.
 */
export default function OtpForm() {
  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");

  const handleEmailSuccess = (email: string) => {
    setSentEmail(email);
    setStep("otp");
  };

  const handleResend = () => {
    setStep("email");
    setSentEmail("");
  };

  if (step === "otp") {
    return <OtpStep email={sentEmail} onResend={handleResend} />;
  }

  return <EmailStep onSuccess={handleEmailSuccess} />;
}
