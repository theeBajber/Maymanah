"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "@/app/ui/form";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

export function PasswordPanel() {
  const router = useRouter();
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "The two passwords do not match" });
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/account?action=change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        const field = response.status === 401 ? "currentPassword" : "newPassword";
        setErrors({ [field]: payload.error ?? "That did not work" });
        setNotice({ tone: "danger", text: payload.error ?? "That did not work. Try again." });
        return;
      }

      // Every device is now signed out, including this one, so the page is
      // reloaded rather than left showing a stale account state.
      setNotice({ tone: "success", text: "Password changed. Sign in again with your new password." });
      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setNotice({ tone: "danger", text: "Could not reach the server. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

      <Field label="Current password" name="currentPassword" error={errors.currentPassword}>
        {(props: FieldRenderProps) => (
          <input {...props} name="currentPassword" type="password" autoComplete="current-password" required maxLength={200} />
        )}
      </Field>

      <Field
        label="New password"
        name="newPassword"
        error={errors.newPassword}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters. Changing it signs out every device.`}
      >
        {(props: FieldRenderProps) => (
          <input {...props} name="newPassword" type="password" autoComplete="new-password" required maxLength={200} />
        )}
      </Field>

      <Field label="Confirm new password" name="confirmPassword" error={errors.confirmPassword}>
        {(props: FieldRenderProps) => (
          <input {...props} name="confirmPassword" type="password" autoComplete="new-password" required maxLength={200} />
        )}
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
