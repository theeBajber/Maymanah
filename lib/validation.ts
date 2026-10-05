import { z } from "zod";

import { toSingleLine } from "./text";

/**
 * Long enough to be meaningful, short enough that a passphrase is the easy
 * option. There is deliberately no requirement for digits, capitals or symbols:
 * those rules push people towards `Password1!`, which is easier to guess than the
 * long phrase they would otherwise choose.
 */
export const PASSWORD_MIN_LENGTH = 10;

/** Bcrypt and scrypt both take a byte string; anything beyond this is a mistake or an attack. */
const PASSWORD_MAX_LENGTH = 200;

const EMAIL_MAX_LENGTH = 254;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

/**
 * Passwords that appear at the top of every breach corpus. A length rule alone
 * does not stop `password1234`, which satisfies any minimum.
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "password1234",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "letmein123",
  "iloveyou1",
  "admin1234",
  "welcome12",
  "maymanah1",
  "quran1234",
]);

/** Normalised text that must fit on one line, such as a name or an address. */
function singleLine(min: number, max: number) {
  return z
    .string()
    .transform(toSingleLine)
    .pipe(z.string().min(min, `Must be at least ${min} characters`).max(max, `Must be at most ${max} characters`));
}

export const registerSchema = z
  .object({
    name: singleLine(NAME_MIN_LENGTH, NAME_MAX_LENGTH),
    email: singleLine(3, EMAIL_MAX_LENGTH).pipe(z.email("Enter a valid email address")).transform((value) => value.toLowerCase()),
    // Deliberately not trimmed. Leading and trailing spaces are legitimate
    // password characters, and silently removing them makes a password that
    // was typed one way stop working.
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Must be at most ${PASSWORD_MAX_LENGTH} characters`),
  })
  .superRefine((value, ctx) => {
    const localPart = value.email.split("@")[0] ?? "";

    if (localPart.length >= 3 && value.password.toLowerCase().includes(localPart.toLowerCase())) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Choose a password that does not contain your email address",
      });
    }

    if (COMMON_PASSWORDS.has(value.password.toLowerCase())) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "That password appears in every list of breached passwords. Choose another.",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: singleLine(3, EMAIL_MAX_LENGTH).pipe(z.email("Enter a valid email address")).transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password").max(PASSWORD_MAX_LENGTH),
  code: z.string().regex(/^\d{6}$/, "Enter the six digit code").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: singleLine(3, EMAIL_MAX_LENGTH).pipe(z.email("Enter a valid email address")).transform((value) => value.toLowerCase()),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Must be at most ${PASSWORD_MAX_LENGTH} characters`),
});

export const verifyCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the six digit code"),
});
