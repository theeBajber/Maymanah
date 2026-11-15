"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusChip } from "@/app/ui/chips";
import { Panel } from "@/app/ui/portal";
import { useToast } from "@/app/ui/toast";
import type { MeetingSettings } from "./types";

/**
 * The teacher's fallback room address for one lesson.
 *
 * Automatic rooms can fail, so this panel is the explicit way out: paste a
 * Google Meet link and the join route will release that instead. The address is
 * write-only here — it is never echoed back, because the join route is the only
 * place allowed to hand it out.
 */
export function MeetingLinkCard({ appointmentId }: { appointmentId: string }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MeetingSettings | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/meetings/settings")
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json().catch(() => ({}))) as MeetingSettings;
        if (!cancelled) setSettings(body);
      })
      .catch(() => {
        // The manual link still works when the settings read fails.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim() || busy) return;

    setBusy(true);
    setSaved(false);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/meeting-link`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        toast({ title: body.error ?? "Could not save the meeting link", variant: "error" });
        return;
      }

      setUrl("");
      setSaved(true);
      toast({ title: "Meeting link saved", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;

    setBusy(true);
    setSaved(false);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/meeting-link`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        toast({ title: body.error ?? "Could not remove the meeting link", variant: "error" });
        return;
      }
      toast({ title: "Meeting link removed", variant: "success" });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full min-h-11 rounded-[10px] border border-border bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus-visible:border-primary";

  let badge = <StatusChip tone="neutral">Checking connection…</StatusChip>;
  let description: React.ReactNode = null;

  if (settings) {
    if (settings.preference === "MANUAL") {
      badge = <StatusChip tone="info">Manual link</StatusChip>;
      description = "Lessons use the link you add below.";
    } else if (settings.connected && settings.status === "CONNECTED") {
      badge = <StatusChip tone="success">Google connected</StatusChip>;
      description = `A room is created in ${settings.calendarName ?? "your lessons calendar"} when either of you joins. The link below is used as a fallback.`;
    } else if (settings.status === "REAUTH_REQUIRED") {
      badge = <StatusChip tone="warning">Reconnect Google</StatusChip>;
      description = (
        <>
          Your calendar connection needs renewing, so lessons use the link below.{" "}
          <a
            href="/settings"
            className="font-semibold text-primary underline underline-offset-4"
          >
            Reconnect it in settings
          </a>
          .
        </>
      );
    } else {
      badge = <StatusChip tone="neutral">Manual link</StatusChip>;
      description = "No calendar is connected, so lessons use the link below.";
    }
  }

  return (
    <Panel className="flex flex-col gap-4 p-5" id="meeting-link">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Meeting link
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            The fallback address if the automatic room does not open.
          </p>
        </div>
        {badge}
      </div>

      {description ? <p className="text-sm text-text-secondary">{description}</p> : null}

      <form onSubmit={save} className="flex flex-col gap-3" noValidate>
        <label htmlFor="meeting-url" className="flex flex-col gap-1.5 text-sm font-semibold text-text-primary">
          Google Meet link
          <input
            id="meeting-url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setSaved(false);
            }}
            placeholder="https://meet.google.com/abc-defg-hij"
            autoComplete="off"
            className={field}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {busy ? "Saving…" : "Save link"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-danger disabled:opacity-50"
          >
            Remove link
          </button>
          {saved ? (
            <span className="text-xs font-medium text-success">Saved. It is ready as a fallback.</span>
          ) : null}
        </div>
      </form>

      <p className="flex items-start gap-1.5 text-xs text-text-secondary">
        <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        Students only see a join button. The address is released when they join, never listed or
        emailed.
      </p>
    </Panel>
  );
}
