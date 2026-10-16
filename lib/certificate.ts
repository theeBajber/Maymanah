import "server-only";

import { randomBytes } from "node:crypto";

import { db } from "./db";

/**
 * Issues a certificate of completion.
 *
 * Idempotent on student and course: finishing twice returns the existing
 * certificate rather than issuing a second one. The verification code is
 * assigned here rather than derived later, so every certificate has one from
 * birth and the public check never meets a code-less row.
 */
export interface IssuedCertificate {
  id: string;
  verificationCode: string;
}

export async function issueCertificate(
  userId: string,
  courseId: string,
  issuedBy?: string,
): Promise<IssuedCertificate> {
  const existing = await db.ijazah.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, verificationCode: true },
  });

  if (existing) {
    // A certificate issued before codes existed still needs one.
    if (existing.verificationCode) {
      return { id: existing.id, verificationCode: existing.verificationCode };
    }
    const code = newVerificationCode();
    await db.ijazah.update({ where: { id: existing.id }, data: { verificationCode: code, isVerified: true } });
    return { id: existing.id, verificationCode: code };
  }

  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) throw new Error("issueCertificate requires an existing course");

  const created = await db.ijazah.create({
    data: {
      userId,
      courseId,
      courseTitle: course.title,
      issuedBy: issuedBy ?? "SYSTEM",
      verificationCode: newVerificationCode(),
      isVerified: true,
    },
    select: { id: true, verificationCode: true },
  });

  return { id: created.id, verificationCode: created.verificationCode! };
}

/** Codes read as MAY-XXXX-XXXXX: prefixed so they are recognisable, random so they are unguessable. */
export function newVerificationCode(): string {
  return `MAY-${randomBytes(4).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

export interface VerifiedCertificate {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  verificationCode: string;
  isVerified: boolean;
}

/**
 * Checks a certificate by its code, falling back to its id.
 *
 * The fallback exists because older links encode the row id rather than a
 * code. Both paths read the same row; neither reveals anything beyond what is
 * printed on the certificate itself.
 */
export async function verifyCertificate(codeOrId: string): Promise<VerifiedCertificate | null> {
  const record =
    (await db.ijazah.findUnique({
      where: { verificationCode: codeOrId },
      select: { issuedAt: true, verificationCode: true, isVerified: true, courseTitle: true, user: { select: { name: true } } },
    })) ??
    (await db.ijazah.findUnique({
      where: { id: codeOrId },
      select: { issuedAt: true, verificationCode: true, isVerified: true, courseTitle: true, user: { select: { name: true } } },
    }));

  if (!record) return null;

  return {
    studentName: record.user.name,
    courseTitle: record.courseTitle,
    issuedAt: record.issuedAt,
    verificationCode: record.verificationCode ?? codeOrId,
    isVerified: record.isVerified,
  };
}

/** Every certificate belonging to a student, newest first. */
export async function getUserCertificates(userId: string) {
  return db.ijazah.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: { id: true, courseTitle: true, issuedAt: true, verificationCode: true, isVerified: true },
  });
}
