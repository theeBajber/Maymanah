"use client";

import { KeyRound, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Field, PasswordInput } from "@/app/ui/input";
import { OtpInput } from "@/app/ui/OtpInput";
import { Panel } from "@/app/ui/portal";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

type Notice = { tone: "success" | "danger" | "info"; text: string } | null;

const TONE_CLASS = {
  success: "border-night-success/40 bg-night-success/10 text-night-success",
  danger: "border-night-danger/40 bg-night-danger/10 text-night-danger",
  info: "border-ivory/15 bg-ivory/[0.04] text-sage",
} as const;

function Notice_({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div role="status" className={`rounded-[10px] border px-4 py-3 text-sm ${TONE_CLASS[notice.tone]}`}>
      {notice.text}
    </div>
  );
}

async function post(body: Record<string, unknown>): Promise<{ ok: true; signedOutEverywhere?: boolean } | { error: string }> {
  const response = await fetch("/api/account", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json().catch(() => ({}))) as never;
}

/* ───────────────────────── two-factor ───────────────────────── */

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const [notice, setNotice] = useState<Notice>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [on, setOn] = useState(enabled);

  async function run(action: string, body: Record<string, unknown>, success: string) {
    setLoading(true);
    setNotice(null);
    const result = await post({ action, ...body }).catch(() => ({ error: "Could not reach the server." }));

    setLoading(false);

    if ("error" in result) {
      setNotice({ tone: "danger", text: result.error });
      return false;
    }

    setNotice({ tone: "success", text: success });
    return true;
  }

  async function onEnable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    if (await run("enable", { password }, "We sent a six digit code to your email address.")) {
      setNotice({ tone: "info", text: "Enter the code below to turn it on." });
    }
  }

  async function onConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run("confirm-enable", { code }, "Two-factor authentication is on. Your other devices were signed out.")) {
      setOn(true);
      setCode("");
    }
  }

  async function onDisable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    if (await run("disable", { password, code }, "Two-factor authentication is off.")) {
      setOn(false);
      setCode("");
    }
  }

  return (
    <Panel className="p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className={`mt-0.5 size-5 shrink-0 ${on ? "text-night-success" : "text-sage/60"}`} />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              {on ? "On — a code is emailed each time you sign in" : "Off — only your password is required"}
            </p>
            <p className="text-[13px] leading-snug text-sage">
              {on
                ? "Turning it off needs your password and a fresh code, so a stolen session cookie on its own cannot remove it."
                : "Turning it on signs out your other devices, since they were created before this protection existed."}
            </p>
          </div>
        </div>

        <Notice_ notice={notice} />

        {!on ? (
          <form onSubmit={onEnable} className="flex flex-col gap-4">
            <Field label="Your password" htmlFor="enable-password">
              <PasswordInput id="enable-password" name="password" icon={<KeyRound />} autoComplete="current-password" required />
            </Field>
            <Button type="submit" size="md" loading={loading} className="w-fit">
              Send me a code
            </Button>
          </form>
        ) : null}

        <form onSubmit={onConfirm} className={`flex flex-col gap-4 ${on ? "hidden" : ""}`}>
          <Field label="Six digit code" htmlFor="enable-code" hint="From the message we just sent.">
            <OtpInput value={code} onChange={setCode} length={6} disabled={loading} />
          </Field>
          <Button type="submit" size="md" loading={loading} className="w-fit">
            Turn on two-factor
          </Button>
        </form>

        {on ? (
          <form onSubmit={onDisable} className="flex flex-col gap-4 border-t border-border pt-5">
            <Field label="Your password" htmlFor="disable-password">
              <PasswordInput id="disable-password" name="password" icon={<KeyRound />} autoComplete="current-password" required />
            </Field>
            <Field label="Six digit code" htmlFor="disable-code" hint="We will send a code to your email address.">
              <OtpInput value={code} onChange={setCode} length={6} disabled={loading} />
            </Field>
            <Button type="submit" variant="ghost" size="md" loading={loading} className="w-fit">
              Turn off two-factor
            </Button>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}

/* ───────────────────────── password ───────────────────────── */

export function PasswordPanel() {
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setNotice({ tone: "danger", text: "The two passwords do not match." });
      setLoading(false);
      return;
    }

    const response = await fetch("/api/account?action=change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).catch(() => null);

    setLoading(false);

    if (!response) {
      setNotice({ tone: "danger", text: "Could not reach the server. Try again shortly." });
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setNotice({ tone: "danger", text: body.error ?? "That did not work." });
      return;
    }

    // Every device is signed out by a password change, including this one.
    window.location.href = "/login?reset=1";
  }

  return (
    <Panel className="p-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Notice_ notice={notice} />

        <Field label="Current password" htmlFor="currentPassword">
          <PasswordInput id="currentPassword" name="currentPassword" icon={<KeyRound />} autoComplete="current-password" required />
        </Field>

        <Field
          label="New password"
          htmlFor="newPassword"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters. Changing it signs out every device.`}
        >
          <PasswordInput id="newPassword" name="newPassword" icon={<KeyRound />} autoComplete="new-password" required />
        </Field>

        <Field label="Confirm new password" htmlFor="confirmPassword">
          <PasswordInput id="confirmPassword" name="confirmPassword" icon={<KeyRound />} autoComplete="new-password" required />
        </Field>

        <Button type="submit" size="md" loading={loading} className="w-fit">
          <Save className="size-4" />
          Change password
        </Button>
      </form>
    </Panel>
  );
}

/* ───────────────────────── devices ───────────────────────── */

export interface Device {
  id: string;
  deviceName: string;
  ipAddress: string;
  createdAt: string;
  current: boolean;
}

export function DeviceList({ devices }: { devices: Device[] }) {
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function revokeAll() {
    setLoading("all");
    setNotice(null);
    const response = await fetch("/api/account", { method: "DELETE" }).catch(() => null);
    setLoading(null);

    if (!response?.ok) {
      setNotice({ tone: "danger", text: "Could not sign out your other devices." });
      return;
    }
    window.location.href = "/login";
  }

  async function revokeOne(id: string) {
    setLoading(id);
    setNotice(null);
    const response = await fetch(`/api/account/device/${id}`, { method: "DELETE" }).catch(() => null);
    setLoading(null);

    if (!response?.ok) {
      setNotice({ tone: "danger", text: "Could not sign that device out." });
      return;
    }
    setNotice({ tone: "success", text: "That device has been signed out." });
  }

  const others = devices.filter((device) => !device.current);

  return (
    <Panel className="p-6">
      <div className="flex flex-col gap-5">
        <Notice_ notice={notice} />

        {others.length === 0 ? (
          <p className="text-sm text-text-secondary">No other devices are signed in.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {others.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border px-4 py-3"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-text-primary">{device.deviceName}</span>
                  <span className="text-xs text-text-muted">
                    {device.ipAddress} · since {new Date(device.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="ghost" size="sm" disabled={loading === device.id} onClick={() => revokeOne(device.id)}>
                  {loading === device.id ? "Signing out" : "Sign out"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {others.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-5">
            <Button variant="ghost" size="md" disabled={loading === "all"} onClick={revokeAll} className="w-fit">
              <Trash2 className="size-4" />
              {loading === "all" ? "Signing out" : "Sign out everywhere"}
            </Button>
            <p className="text-xs text-text-muted">
              Worth doing if you think someone else has used your account.
            </p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
