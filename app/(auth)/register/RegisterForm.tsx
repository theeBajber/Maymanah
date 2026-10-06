"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "../../ui/form";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (response.ok) {
        // Straight to sign-in rather than a confirmation page: the account
        // exists and can be used immediately, and the banner on the portal
        // handles the unconfirmed address.
        router.push("/login?registered=1");
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string; fields?: FieldErrors };
      setErrors({ ...(body.fields ?? {}), form: body.error });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {errors.form ? <FormNotice tone="danger">{errors.form}</FormNotice> : null}

      <Field label="Full name" name="name" error={errors.name}>
        {(props: FieldRenderProps) => (
          <input {...props} name="name" type="text" autoComplete="name" required maxLength={80} placeholder="Amina Yusuf" />
        )}
      </Field>

      <Field label="Email address" name="email" error={errors.email}>
        {(props: FieldRenderProps) => (
          <input {...props} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
        )}
      </Field>

      <Field
        label="Password"
        name="password"
        error={errors.password}
        hint="At least 10 characters. A short phrase you can remember beats a short password with symbols."
      >
        {(props: FieldRenderProps) => <input {...props} name="password" type="password" autoComplete="new-password" required maxLength={200} />}
      </Field>

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}