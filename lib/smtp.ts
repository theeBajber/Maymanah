import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { env } from "./env";
import type { MailTransport, OutgoingMessage } from "./mailer";

/**
 * Delivers mail through an SMTP server.
 *
 * Created once and reused: the connection pool inside the transporter survives
 * across sends in the same process, so each email does not pay for a new
 * handshake. A failed send rejects rather than resolving quietly, because the
 * callers already distinguish a sent message from an unsent one.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = env();

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  return transporter;
}

export function createSmtpTransport(from: string): MailTransport {
  return {
    async send(message: OutgoingMessage): Promise<void> {
      await getTransporter().sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
    },
  };
}

/** For tests, which must not create real connections. */
export function resetSmtpTransport(): void {
  transporter = null;
}
