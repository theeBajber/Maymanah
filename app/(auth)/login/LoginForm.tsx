"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "../../ui/form";

/** Why the previous attempt did not succeed, in words rather than an error code. */
function describeError(code: string | null, query: { registered?: string }): string | null {
  if (query.registered === "1") return null;

  switch (code) {
    case "two_factor_required":
      return "Enter the six digit code we sent you.";
    case "CredentialsSignin":
      return "That email address and password do not match an account.";
    default:
      return "Could not sign you in. Please try again.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const errorCode = params.get("code");
  const query = { registered: params.get("registered") ?? undefined };

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [needsCode, setNeedsCode] = useState(errorCode === "two_factor_required");
  const [pending, setPending] = useState(false);

  const message = needsCode
    ? "Enter the six digit code we sent you."
    : describeError(errorCode, query);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim();

    try {
      const result = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        ...(code ? { code } : {}),
        redirect: false,
      });

      if (result?.error) {
        // A code challenge asks for one more field rather than replacing the
        // form, so the address and password are not retyped.
        if (result.error === "CredentialsSignin" && errorCode === "two_factor_required") {
          setErrors({ code: "That code is not right. Try the most recent message." });
        } else if (result.code === "two_factor_required") {
          setNeedsCode(true);
          setErrors({ code: "That code is not right. Try the most recent message." });
        } else {
          setErrors({ form: "That email address and password do not match an account." });
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {query.registered === "1" && !needsCode ? (
        <FormNotice tone="success">Account created. Sign in to continue.</FormNotice>
      ) : null}

      {message ? <FormNotice tone={needsCode ? "info" : "danger"}>{message}</FormNotice> : null}

      {errors.form ? <FormNotice tone="danger">{errors.form}</FormNotice> : null}

      <Field label="Email address" name="email" error={errors.email}>
        {(props: FieldRenderProps) => <input {...props} name="email" type="email" autoComplete="email" required maxLength={254} />}
      </Field>

      <Field label="Password" name="password" error={errors.password}>
        {(props: FieldRenderProps) => <input {...props} name="password" type="password" autoComplete="current-password" required maxLength={200} />}
      </Field>

      {needsCode ? (
        <Field
          label="Two-factor code"
          name="code"
          error={errors.code}
          hint="Six digits, from the most recent email. It expires after ten minutes."
        >
          {(props: FieldRenderProps) => (
            <input
              {...props}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
            />
          )}
        </Field>
      ) : null}

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Signing in…" : needsCode ? "Verify and sign in" : "Sign in"}
      </Button>
    </form>
  );
}