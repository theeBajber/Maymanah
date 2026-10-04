import { describe, expect, it } from "vitest";

import {
  createConsoleTransport,
  oneTimeCodeEmailContent,
  passwordResetEmailContent,
  type OutgoingMessage,
  verificationEmailContent,
  verificationLink,
  passwordResetLink,
} from "./mailer";

describe("verificationEmailContent", () => {
  const content = verificationEmailContent("Amina", "https://maymanah.org/verify-email?token=abc");

  it("addresses the recipient by name", () => {
    expect(content.text).toContain("Amina");
  });

  it("includes the confirmation link", () => {
    expect(content.text).toContain("https://maymanah.org/verify-email?token=abc");
  });

  it("tells someone who did not sign up that it is safe to ignore", () => {
    expect(content.text.toLowerCase()).toContain("did not create this account");
  });
});

describe("passwordResetEmailContent", () => {
  const content = passwordResetEmailContent("Yusuf", "https://maymanah.org/reset-password?token=xyz");

  it("includes the reset link", () => {
    expect(content.text).toContain("token=xyz");
  });

  it("says the link is single use and expires", () => {
    expect(content.text).toContain("once");
    expect(content.text).toContain("expires");
  });

  it("reassures someone who did not request a reset", () => {
    expect(content.text).toContain("nothing has changed");
  });

  it("never contains a password", () => {
    expect(content.text).not.toContain("password:");
  });
});

describe("oneTimeCodeEmailContent", () => {
  const content = oneTimeCodeEmailContent("Bilal", "042918");

  it("includes the code", () => {
    expect(content.text).toContain("042918");
  });

  it("preserves the leading zero of a code", () => {
    expect(content.text).toContain("Your sign-in code is 042918");
    expect(content.text).not.toContain("Your sign-in code is 42918");
  });

  it("advises changing the password if the sign-in was not theirs", () => {
    expect(content.text).toContain("change your password");
  });
});

describe("links", () => {
  it("percent-encodes a token so it cannot break out of the query string", () => {
    expect(verificationLink("a+b/c=d")).toContain("a%2Bb%2Fc%3Dd");
  });

  it("routes each token to its own page", () => {
    expect(verificationLink("t")).toContain("/verify-email?token=t");
    expect(passwordResetLink("t")).toContain("/reset-password?token=t");
  });
});

describe("console transport", () => {
  it("records the recipient, subject and body", async () => {
    const lines: string[] = [];
    const transport = createConsoleTransport((line) => lines.push(line));

    await transport.send({ to: "a@example.com", subject: "Confirm your email address", text: "body here" });

    const output = lines.join("\n");
    expect(output).toContain("a@example.com");
    expect(output).toContain("Confirm your email address");
    expect(output).toContain("body here");
  });

  it("does not print the raw message as an object, which would hide the body", async () => {
    const lines: string[] = [];
    await createConsoleTransport((line) => lines.push(line)).send({
      to: "a@example.com",
      subject: "s",
      text: "t",
    });

    expect(lines.join("")).toContain("t");
  });
});

describe("message shape", () => {
  it("carries only plain text fields", () => {
    const message: OutgoingMessage = { to: "a@example.com", subject: "s", text: "t" };

    expect(Object.keys(message).sort()).toEqual(["subject", "text", "to"]);
  });
});
