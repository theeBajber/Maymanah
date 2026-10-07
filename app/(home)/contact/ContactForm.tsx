"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { Field, Input, } from "@/app/ui/input";
import { toMultiLine, toSingleLine } from "@/lib/text";

/**
 * Length limits are enforced before sending, with the remaining count shown, so
 * somebody is not told a message is too long only after writing it. A limit
 * enforced only in the browser is not a limit, so the same bounds are re-checked
 * before the request goes out.
 */
const MESSAGE_MAX = 2000;
const MESSAGE_MIN = 10;
const EMAIL_MAX = 254;
const NAME_MAX = 80;

export function ContactForm() {
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(MESSAGE_MAX);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const name = toSingleLine(String(form.get("name") ?? ""));
    const email = toSingleLine(String(form.get("email") ?? "")).toLowerCase();
    const message = toMultiLine(String(form.get("message") ?? ""));

    if (!name || name.length > NAME_MAX || !email || email.length > EMAIL_MAX) {
      setNotice({ tone: "danger", text: "Please check your name and email address." });
      setLoading(false);
      return;
    }

    if (message.length < MESSAGE_MIN) {
      setNotice({ tone: "danger", text: "Please write a little more so we can help." });
      setLoading(false);
      return;
    }

    if (message.length > MESSAGE_MAX) {
      setNotice({ tone: "danger", text: `Please keep it under ${MESSAGE_MAX} characters.` });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSent(true);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setNotice({ tone: "danger", text: body.error ?? "Could not send your message. Try again shortly." });
    } catch {
      setNotice({ tone: "danger", text: "Could not reach the server. Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass-pane flex flex-col items-center gap-4 rounded-2xl p-8 text-center">
        <p className="text-base font-semibold text-night-success">Thank you. Your message has been received.</p>
        <p className="text-sm text-sage">We reply to most messages within a couple of days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass-pane flex flex-col gap-5 rounded-2xl p-6 sm:p-8">
      {notice ? (
        <div
          role="alert"
          className="rounded-[10px] border border-night-danger/40 bg-night-danger/10 px-4 py-3 text-sm text-night-danger"
        >
          {notice.text}
        </div>
      ) : null}

      <Field label="Your name" htmlFor="name">
        <Input id="name" name="name" type="text" autoComplete="name" maxLength={NAME_MAX} required />
      </Field>

      <Field label="Email address" htmlFor="email" hint="So we can reply to you.">
        <Input id="email" name="email" type="email" autoComplete="email" maxLength={EMAIL_MAX} required />
      </Field>

      <Field label="Message" htmlFor="message" hint={`${remaining} characters remaining`}>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={MESSAGE_MAX}
          onChange={(event) => setRemaining(MESSAGE_MAX - event.target.value.length)}
          className="w-full resize-y rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-[15px] text-ivory transition-all duration-300 placeholder:text-sage/40 focus:border-brass/60 focus:shadow-[0_0_0_3px_rgba(198,161,91,0.12),0_0_28px_-8px_rgba(198,161,91,0.35)] focus:outline-none"
        />
      </Field>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        <Send className="size-4" />
        {loading ? "Sending" : "Send message"}
      </Button>
    </form>
  );
}