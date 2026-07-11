import { prisma, safeQuery } from "@/lib/prisma";
import { randomBytes } from "crypto";

function generateVerificationCode(): string {
  return `MAY-${randomBytes(4).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

export async function issueCertificate(userId: string, courseId: string, issuedBy?: string) {
  const existing = await safeQuery(() =>
    prisma.ijazah.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
  );
  if (existing) return existing;

  const [user, course] = await Promise.all([
    safeQuery(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
    ),
    safeQuery(() =>
      prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      }),
    ),
  ]);

  if (!user || !course) return null;

  const verificationCode = generateVerificationCode();

  const ijazah = await safeQuery(() =>
    prisma.ijazah.create({
      data: {
        userId,
        courseId,
        issuedBy: issuedBy ?? "SYSTEM",
        isVerified: true,
        verificationCode,
      },
    }),
  );

  return ijazah;
}

export async function getCertificate(certificateId: string) {
  return safeQuery(() =>
    prisma.ijazah.findUnique({
      where: { id: certificateId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  );
}

export async function verifyCertificate(code: string) {
  return safeQuery(() =>
    prisma.ijazah.findUnique({
      where: { verificationCode: code },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  );
}

export async function getUserCertificates(userId: string) {
  return safeQuery(() =>
    prisma.ijazah.findMany({
      where: { userId },
      include: {
        course: { select: { title: true, slug: true, image: true, category: true } },
      },
      orderBy: { issuedAt: "desc" },
    }),
  );
}
