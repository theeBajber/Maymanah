import "server-only";

import { env } from "./env";
import { createSmtpTransport } from "./smtp";

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

/**
 * The transport in use.
 *
 * SMTP when a host is configured, the console otherwise. Selected on first
 * send rather than at import, so loading this module never requires
 * credentials: tests and builds run without any mail configuration at all.
 */
export const mailer: MailTransport = {
  send: (message) => activeTransport().send(message),
};

/**
 * Sends one message, reporting rather than throwing on failure.
 *
 * Reminders and standing notices are secondary to the job that triggers them:
 * a mail server that is down must not stop the rest of an hourly sweep. The
 * failure is logged, and the caller can decide whether to try again.
 */
export async function sendEmail(message: OutgoingMessage): Promise<boolean> {
  try {
    await mailer.send(message);
    return true;
  } catch (error) {
    console.error("Could not send email", error);
    return false;
  }
}

let cached: MailTransport | null = null;

function activeTransport(): MailTransport {
  if (cached) return cached;

  if (process.env.TEST_MODE === "true") {
    // The end-to-end suite registers many accounts; delivering those messages
    // for real would reach strangers' inboxes and slow the run down.
    cached = createConsoleTransport();
    return cached;
  }

  try {
    const config = env();
    cached = config.SMTP_HOST ? createSmtpTransport(config.SMTP_FROM) : createConsoleTransport();
  } catch {
    // Missing or invalid environment falls through to the console below,
    // because a message printed is better than a boot failure for mail.
    cached = createConsoleTransport();
  }
  return cached;
}

/** For tests, which select their own transport explicitly. */
export function resetMailer(): void {
  cached = null;
}

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

/** Approval of a teacher's application. */
export function teacherApprovalEmailContent(name: string): EmailContent {
  return {
    subject: "Your teacher application is approved",
    text: [
      `Assalamu alaikum ${name},`,
      "",
      "Your application to teach on Maymanah has been approved. Students can now be paired with you.",
      "",
      "Open your dashboard to set your availability and meet your students.",
    ].join("\n"),
  };
}

/** Decline of a teacher's application, with the reason when one was given. */
export function teacherRejectionEmailContent(name: string, reason?: string): EmailContent {
  return {
    subject: "About your teacher application",
    text: [
      `Assalamu alaikum ${name},`,
      "",
      "Thank you for applying to teach on Maymanah. We are not able to approve your application at this time.",
      ...(reason ? ["", `Reason given: ${reason}`] : []),
      "",
      "You are welcome to apply again later.",
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

/**
 * Session reminder sent an hour ahead.
 *
 * The link points at the session inside the app rather than at a meeting room:
 * the room address is only released once the recipient is signed in and the
 * join window is open.
 */
export function sessionReminderEmailContent(
  name: string,
  title: string,
  when: string,
  sessionLink: string,
): EmailContent {
  return {
    subject: `Reminder: ${title} at ${when}`,
    text: [
      `Assalamu alaikum ${name},`,
      "",
      `This is a reminder that ${title} starts at ${when}.`,
      "",
      `Open the session: ${sessionLink}`,
      "",
      "Joining opens shortly before the lesson. Your camera and microphone start off.",
    ].join("\n"),
  };
}

export type StandingEmailLevel = "WARNED" | "PAUSED" | "DISABLED";

/**
 * Account notice for a rung on the attendance ladder.
 *
 * The link is to the account status page, never to a meeting. It explains what
 * changed and what the recipient can do next, without naming another student.
 */
export function standingEmailContent(
  name: string,
  standing: StandingEmailLevel,
  reason: string,
  statusLink: string,
): EmailContent {
  const details: Record<StandingEmailLevel, { subject: string; body: string[] }> = {
    WARNED: {
      subject: "A note about your recent sessions",
      body: [
        "Some sessions you were expected at were missed recently. This is a warning, not a restriction: you can keep attending and booking as usual.",
        "If something is making it hard to attend, reply to this message or speak to your teacher so the time can be rearranged.",
      ],
    },
    PAUSED: {
      subject: "New bookings are paused on your account",
      body: [
        "Because of repeated missed sessions, new bookings are paused on your account. Your existing lessons, course access, and teaching place are unchanged.",
        "Contact us when you are ready to return and we will review the pause.",
      ],
    },
    DISABLED: {
      subject: "Your Maymanah account has been disabled",
      body: [
        "After repeated missed sessions, an administrator has disabled your account. You can still sign in to see this status page, but you cannot book or join sessions.",
        "If you believe this is a mistake, reply to this message and we will review it.",
      ],
    },
  };

  const copy = details[standing];

  return {
    subject: copy.subject,
    text: [
      `Assalamu alaikum ${name},`,
      "",
      ...copy.body,
      "",
      `Reason: ${reason}`,
      "",
      `Your account status: ${statusLink}`,
    ].join("\n"),
  };
}
