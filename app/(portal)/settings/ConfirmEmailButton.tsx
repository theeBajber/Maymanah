"use client";

import { useState } from "react";

/**
 * Sends another confirmation message for an unconfirmed address.
 *
 * Fetches with a JSON body rather than posting a form, because the endpoint
 * speaks JSON and a form post would arrive in a shape it does not accept. The
 * outcome is shown in place rather than navigating away, since there is nothing
 * on the next page to look at.
 */
export function ConfirmEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<{ status: "idle" | "sending" | "sent" | "error"; text?: string }>({
    status: "idle",
  });

  async function send() {
    setState({ status: "sending" });

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setState({ status: "sent", text: "Sent. Check your inbox for the link." });
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setState({ status: "error", text: body.error ?? "Could not send just now. Try again shortly." });
    } catch {
      setState({ status: "error", text: "Could not reach the server. Try again shortly." });
    }
  }

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        onClick={send}
        disabled={state.status === "sending"}
        className="font-semibold text-primary underline underline-offset-4 disabled:opacity-60 text-left"
      >
        {state.status === "sending" ? "Sending…" : "Send another confirmation"}
      </button>
      {state.text ? <span className="text-xs text-text-secondary">{state.text}</span> : null}
    </span>
  );
}