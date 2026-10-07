"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "@/app/ui/form";

type Stage = "idle" | "awaiting_code" | "disabling";

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(enabled ? "disabling" : "idle");
  const [notice, setNotice] = useState<{ tone: "success" | "danger" | "info"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);

  async function send(action: string, body: Record<string, unknown>) {
    setPending(true);
    setErrors({});
    setNotice(null);

    try {
      const response = await fetch(`/api/account?action=${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        setNotice({ tone: "danger", text: payload.error ?? "That did not work. Try again." });
        return null;
      }

      return payload as { ok: true; message?: string; signedOutEverywhere?: boolean };
    } catch {
      setNotice({ tone: "danger", text: "Could not reach the server. Check your connection and try again." });
      return null;
    } finally {
      setPending(false);
    }
  }

  async function onEnable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const result = await send("enable", { password: String(form.get("password") ?? "") });
    if (!result) return;

    setStage("awaiting_code");
    setNotice({ tone: "info", text: "We sent a six digit code to your email address. Enter it below." });
  }

  async function onConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const result = await send("confirm-enable", { code: String(form.get("code") ?? "") });
    if (!result) return;

    setNotice({
      tone: "success",
      text: "Two-factor authentication is on. Your other devices have been signed out.",
    });
    setStage("disabling");
    router.refresh();
  }

  async function onDisable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const result = await send("disable", {
      password: String(form.get("password") ?? ""),
      code: String(form.get("code") ?? ""),
    });
    if (!result) return;

    setStage("idle");
    setNotice({ tone: "success", text: "Two-factor authentication is off." });
    router.refresh();
  }

  if (stage === "awaiting_code") {
    return (
      <form onSubmit={onConfirm} noValidate className="flex flex-col gap-5">
        {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

        <Field label="Six digit code" name="code" hint="From the message we just sent. It expires after ten minutes.">
          {(props: FieldRenderProps) => (
            <input {...props} name="code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required autoFocus />
          )}
        </Field>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Confirming…" : "Turn on"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => {
              setStage("idle");
              setNotice(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  if (enabled) {
    return (
      <form onSubmit={onDisable} noValidate className="flex flex-col gap-5">
        {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

        <FormNotice tone="success">Two-factor authentication is on for this account.</FormNotice>

        <p className="text-sm text-text-secondary">
          Turning it off needs both your password and a fresh code, so that a stolen session cookie on its own
          cannot remove the protection.
        </p>

        <Field label="Your password" name="password">
          {(props: FieldRenderProps) => (
            <input {...props} name="password" type="password" autoComplete="current-password" required maxLength={200} />
          )}
        </Field>

        <Field label="Six digit code" name="code" hint="We will send a code to your email address.">
          {(props: FieldRenderProps) => (
            <input {...props} name="code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required />
          )}
        </Field>

        <Button type="submit" variant="secondary" size="lg" disabled={pending}>
          {pending ? "Turning off…" : "Turn off two-factor"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={onEnable} noValidate className="flex flex-col gap-5">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

      <p className="text-sm text-text-secondary">
        A six digit code is emailed to you each time you sign in. Turning it on signs out your other devices, since
        they were created before this protection existed.
      </p>

      <Field label="Your password" name="password" error={errors.password}>
        {(props: FieldRenderProps) => (
          <input {...props} name="password" type="password" autoComplete="current-password" required maxLength={200} />
        )}
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending code…" : "Turn on two-factor"}
      </Button>
    </form>
  );
}
