"use client";

import { useState } from "react";

import { Button, Field, FormNotice, type FieldRenderProps } from "@/app/ui/form";
import { toMultiLine, toSingleLine } from "@/lib/text";

/**
 * The contact form.
 *
 * Length limits are enforced before sending, with the remaining count shown, so
 * a person is not told a message is too long only after writing it. A message is
 * capped well below what the transport accepts, since a contact message is not a
 * place to accept an upload by mistake.
 */
const MESSAGE_MAX = 2000;
const EMAIL_MAX = 254;
const NAME_MAX = 80;

export function ContactForm() {
  const [state, setState] = useState<{ status: "idle" | "sending" | "sent" | "error"; message?: string }>({
    status: "idle",
  });
  const [remaining, setRemaining] = useState(MESSAGE_MAX);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "sending" });

    const form = new FormData(event.currentTarget);
    const name = toSingleLine(String(form.get("name") ?? ""));
    const email = toSingleLine(String(form.get("email") ?? ""));
    const message = toMultiLine(String(form.get("message") ?? ""));

    // Re-checked here as well as in the browser, because a limit enforced only on
    // the client is not a limit.
    if (!name || name.length > NAME_MAX || !email || email.length > EMAIL_MAX || !message || message.length > MESSAGE_MAX) {
      setState({ status: "error", message: "Please check the length of each field." });
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setState({ status: "sent" });
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setState({ status: "error", message: body.error ?? "Could not send your message. Try again shortly." });
    } catch {
      setState({ status: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="flex flex-col gap-5">
        <FormNotice tone="success">Thank you. Your message has been received.</FormNotice>
        <Button variant="secondary" size="lg" fullWidth onClick={() => setState({ status: "idle" })}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {state.status === "error" && state.message ? <FormNotice tone="danger">{state.message}</FormNotice> : null}

      <Field label="Your name" name="name">
        {(props: FieldRenderProps) => (
          <input {...props} name="name" type="text" autoComplete="name" required maxLength={NAME_MAX} />
        )}
      </Field>

      <Field label="Email address" name="email" hint="So we can reply to you.">
        {(props: FieldRenderProps) => (
          <input {...props} name="email" type="email" autoComplete="email" required maxLength={EMAIL_MAX} />
        )}
      </Field>

      <Field
        label="Message"
        name="message"
        hint={`${remaining} characters remaining`}
      >
        {(props: FieldRenderProps) => (
          <textarea
            {...props}
            name="message"
            rows={6}
            required
            maxLength={MESSAGE_MAX}
            className={`${props.className} resize-y`}
            onChange={(event) => setRemaining(MESSAGE_MAX - event.target.value.length)}
          />
        )}
      </Field>

      <Button type="submit" size="lg" fullWidth disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}