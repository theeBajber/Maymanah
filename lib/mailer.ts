import "server-only";

import { env } from "./env";

/**
 * Delivery of transactional messages.
 *
 * Authentication needs to send three things: an address confirmation, a
 * password reset link, and a one-time code. Whether those actually reach an
 * inbox is a deployment concern, so it sits behind this interface. The console
 * transport below keeps the flows working and inspectable in development, and a
 * real provider replaces it without any call site changing.
 *
 * Messages are plain text. Nothing here composes HTML, which means there is no
 * template to escape user-supplied values into.
 */
export interface OutgoingMessage {
  to: string;
  subject: string;
  text: string;
}

export interface MailTransport {
  send(message: OutgoingMessage): Promise<void>;
}

/** Prints the message to the server log instead of delivering it. */
export function createConsoleTransport(log: (line: string) => void = console.log): MailTransport {
  return {
    async send(message) {
      log(
        [
          "",
          "── email (console transport) ──",
          `to:      ${message.to}`,
          `subject: ${message.subject}`,
          "",
          message.text,
          "───────────────────────────────",
          "",
        ].join("\n"),
      );
    },
  };
}

export const mailer: MailTransport = createConsoleTransport();

export interface EmailContent {
  subject: string;
  text: string;
}

/** Address confirmation, sent when an account is registered. */
export function verificationEmailContent(name: string, link: string): EmailContent {
  return {
    subject: "Confirm your email address",
    text: [
      `Assalamu alaikum ${name},`,
      "",
      "Confirm your email address to finish setting up your Maymanah account:",
      "",
      link,
      "",
      "If you did not create this account, you can ignore this message.",
    ].join("\n"),
  };
}

/** Password reset, sent in response to a forgot-password request. */
export function passwordResetEmailContent(name: string, link: string): EmailContent {
  return {
    subject: "Reset your password",
    text: [
      `Assalamu alaikum ${name},`,
      "",
      "Use the link below to choose a new password. It can be used once, and expires shortly.",
      "",
      link,
      "",
      "If you did not request this, nothing has changed and you can ignore this message.",
    ].join("\n"),
  };
}

/** One-time code for two-factor authentication. */
export function oneTimeCodeEmailContent(name: string, code: string): EmailContent {
  return {
    subject: "Your sign-in code",
    text: [
      `Assalamu alaikum ${name},`,
      "",
      `Your sign-in code is ${code}`,
      "",
      "It expires shortly and can only be used once. If you did not try to sign in, change your password.",
    ].join("\n"),
  };
}

/** Builds the base URL for links in an email, from the deployment's own origin. */
export function baseUrl(): string {
  return env().APP_URL.replace(/\/$/, "");
}

export function verificationLink(token: string): string {
  return `${baseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

export function passwordResetLink(token: string): string {
  return `${baseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}
