import "server-only";

import { mailer } from "@/lib/mailer";
import { consumeRateLimit } from "@/lib/rate-limit";

/**
 * Accepts a message from the contact page.
 *
 * The message is delivered as plain text through the mail transport. Nothing
 * here composes HTML, so a name containing angle brackets is delivered as
 * characters rather than as markup.
 */

/** Messages allowed per client address in an hour. */
const CONTACT_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 254,
  messageMax: 2000,
  messageMin: 10,
} as const;

export type ContactFailure = "rate_limited" | "too_short" | "too_long" | "invalid_address" | "not_sent";

export type ContactOutcome = { ok: true } | { ok: false; reason: ContactFailure };

/** Where contact messages go. Absent until mail delivery is configured. */
function destination(): string | undefined {
  return process.env.CONTACT_EMAIL;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
  clientIp: string;
}): Promise<ContactOutcome> {
  const limit = await consumeRateLimit({
    key: `contact:${input.clientIp}`,
    ...CONTACT_LIMIT,
  });

  if (!limit.allowed) return { ok: false, reason: "rate_limited" };

  if (input.message.length < CONTACT_LIMITS.messageMin) return { ok: false, reason: "too_short" };
  if (input.message.length > CONTACT_LIMITS.messageMax) return { ok: false, reason: "too_long" };
  if (!input.email.includes("@")) return { ok: false, reason: "invalid_address" };

  const to = destination();

  // Without a destination the message cannot be delivered, and reporting success
  // would leave a person believing they had been heard.
  if (!to) {
    console.warn("Contact form received a message but no CONTACT_EMAIL is configured", {
      from: input.email,
      name: input.name,
    });
    return { ok: false, reason: "not_sent" };
  }

  try {
    await mailer.send({
      to,
      subject: `Contact from ${input.name}`,
      text: [`From: ${input.name} <${input.email}>`, "", input.message].join("\n"),
    });
  } catch (error) {
    console.error("Could not deliver contact message", error);
    return { ok: false, reason: "not_sent" };
  }

  return { ok: true };
}