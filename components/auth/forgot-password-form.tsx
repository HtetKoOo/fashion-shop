"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import AuthFormPanel from "@/components/auth/auth-form-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailOtp } from "@/lib/auth-client";
import { emailSchema, otpSchema, registerSchema } from "@/lib/validations/auth";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function requestCode(address: string) {
    setError("");
    setMessage("");

    const parsed = emailSchema.safeParse({
      email: address.trim().toLowerCase(),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);

    try {
      const { error: requestError } = await emailOtp.requestPasswordReset({
        email: parsed.data.email,
      });

      if (requestError) {
        setError("Could not request a reset code. Try again shortly.");
        return;
      }

      setResetEmail(parsed.data.email);
      setMessage(
        "If an account exists for this email, a reset code has been sent.",
      );
    } catch {
      setError("Could not request a reset code. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const fields = new FormData(event.currentTarget);
    const otp = otpSchema.safeParse({
      email: resetEmail,
      otp: fields.get("otp"),
    });
    const password = registerSchema.shape.password.safeParse(
      fields.get("password"),
    );

    if (!otp.success) {
      setError(otp.error.issues[0].message);
      return;
    }

    if (!password.success) {
      setError(password.error.issues[0].message);
      return;
    }

    if (password.data !== fields.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const { error: resetError } = await emailOtp.resetPassword({
        email: otp.data.email,
        otp: otp.data.otp,
        password: password.data,
      });

      if (resetError) {
        setError(
          "Could not reset your password. Check the code or request a new one.",
        );
        return;
      }

      router.replace("/login?reset=success");
    } catch {
      setError("Could not reset your password. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFormPanel
      title={resetEmail ? "Reset password" : "Forgot password?"}
      description={
        resetEmail
          ? `Enter the reset code for ${resetEmail}.`
          : "Enter your email to request a password reset code."
      }
      footer={
        <Link href="/login" className="underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {!resetEmail ? (
        <form
          key="request-code"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode(email);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={pending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form
          key="reset-password"
          className="space-y-4"
          onSubmit={resetPassword}
        >
          <div className="space-y-2">
            <Label htmlFor="reset-otp">Verification code</Label>
            <Input
              id="reset-otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={pending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Resetting…" : "Reset password"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => void requestCode(resetEmail)}
          >
            Resend code
          </Button>
        </form>
      )}
    </AuthFormPanel>
  );
}