"use client";

import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "@/app/ui/form";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (response.ok) {
        setSent(true);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setErrors({ form: body.error ?? "Could not send a reset link. Try again shortly." });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        {/* Deliberately does not confirm whether an account exists. */}
        <FormNotice tone="success">
          If an account exists for that address, a reset link is on its way. It expires within a day.
        </FormNotice>
        <Button variant="secondary" size="lg" fullWidth onClick={() => setSent(false)}>
          Use a different address
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {errors.form ? <FormNotice tone="danger">{errors.form}</FormNotice> : null}

      <Field label="Email address" name="email" error={errors.email}>
        {(props: FieldRenderProps) => (
          <input {...props} name="email" type="email" autoComplete="email" required maxLength={254} />
        )}
      </Field>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}