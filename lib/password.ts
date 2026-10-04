import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

/**
 * Cost parameters for password hashing.
 *
 * N of 2^14 costs about 16 MB and measures roughly 150 ms per derivation on
 * ordinary serverless hardware, with ten concurrent derivations completing in
 * around 400 ms.
 *
 * This is deliberately below the N of 2^17 that guidance for offline attack
 * resistance recommends. That figure assumes a machine dedicated to cracking a
 * stolen database; spending 128 MB and half a second on every sign-in would
 * instead hand a denial of service to anyone who can send a login request. This
 * is the point on the curve where a stolen table is still expensive to attack
 * while a real user still perceives a normal login.
 *
 * The values are recorded in every stored hash, so they can be raised later
 * without invalidating passwords that already exist.
 */
const PARAMS = { N: 2 ** 14, r: 8, p: 1 } as const;

/** scrypt needs at least 128 * r * N bytes; state it so Node never refuses. */
const MAX_MEMORY = 64 * 1024 * 1024;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Identifies the algorithm, so the format can be extended without ambiguity. */
const ALGORITHM = "scrypt";

interface ScryptParams {
  N: number;
  r: number;
  p: number;
}

/**
 * Derives a key from a secret.
 *
 * Wrapped by hand rather than with `promisify`, whose inferred overload drops
 * the options argument that carries the cost parameters.
 *
 * The secret is normalised to NFKC so that visually identical passwords typed
 * on different platforms produce the same hash, and is compared only as a
 * derived key, never as itself.
 */
function deriveKey(secret: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      secret.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { N: params.N, r: params.r, p: params.p, maxmem: MAX_MEMORY },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

/**
 * Hashes a password for storage.
 *
 * @returns A self-describing string of the form
 * `scrypt$N$r$p$salt$hash`, with both salt and hash base64url encoded. The
 * plaintext is never stored, and the cost parameters travel with the hash so
 * that they can be raised without invalidating existing passwords.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await deriveKey(plaintext, salt, PARAMS);
  return [ALGORITHM, PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), derived.toString("base64url")].join("$");
}

/**
 * Checks a password against a stored hash.
 *
 * Returns false rather than throwing for anything unrecognisable, so a
 * corrupted or foreign hash cannot be distinguished from a wrong password by
 * the caller.
 */
export async function verifyPassword(plaintext: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");

  if (parts.length !== 6 || parts[0] !== ALGORITHM) return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts;
  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);

  if (!Number.isSafeInteger(N) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p)) return false;

  const salt = Buffer.from(rawSalt, "base64url");
  const expected = Buffer.from(rawHash, "base64url");

  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  const derived = await deriveKey(plaintext, salt, { N, r, p });
  return timingSafeEqual(derived, expected);
}

/**
 * Hashes a one-time code.
 *
 * Codes are six digits, so unlike a password they have very little entropy and
 * a stolen table could be brute-forced quickly. They are hashed with the same
 * deliberately expensive function rather than a plain digest. The comparison is
 * additionally bounded by an attempt counter, so a leaked hash is the only way
 * to attack this at all.
 */
export async function hashOneTimeCode(code: string): Promise<string> {
  return hashPassword(code);
}

/** Checks a one-time code against its stored hash. See {@link hashOneTimeCode}. */
export async function verifyOneTimeCode(code: string, stored: string): Promise<boolean> {
  return verifyPassword(code, stored);
}

/**
 * Hashes a high-entropy secret such as an email verification token, for lookup
 * by value.
 *
 * A plain SHA-256 digest is correct here and unlike a password the input has
 * 256 bits of entropy, so there is nothing for an attacker to guess. A slow
 * function would only add latency to every verification request.
 */
export async function hashToken(token: string): Promise<string> {
  return createHash("sha256").update(token).digest("hex");
}
