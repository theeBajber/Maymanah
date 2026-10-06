"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "@/app/ui/form";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password: form.get("password") }),
      });

      if (response.ok) {
        router.push("/login?reset=1");
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setErrors({ form: body.error ?? "Could not reset your password." });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return <FormNotice tone="danger">That reset link is not valid. Request a new one.</FormNotice>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {errors.form ? <FormNotice tone="danger">{errors.form}</FormNotice> : null}

      <Field
        label="New password"
        name="password"
        error={errors.password}
        hint="At least 10 characters. Choosing a new one signs out your other devices."
      >
        {(props: FieldRenderProps) => (
          <input {...props} name="password" type="password" autoComplete="new-password" required maxLength={200} autoFocus />
        )}
      </Field>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}