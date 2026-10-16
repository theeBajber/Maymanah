import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { renderCertificatePdf } from "@/lib/certificate-pdf";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Downloads a certificate as PDF.
 *
 * Only the holder or an administrator may fetch it. Anyone else gets the same
 * refusal whether or not the certificate exists, so identifiers cannot be
 * probed through this route — the public verification page is the way to
 * check a certificate, and it shows only what is printed on it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getCurrentUser(await auth());
  if (!user) {
    return NextResponse.json({ error: "Sign in to do this" }, { status: 401 });
  }

  const { id } = await params;

  const certificate = await db.ijazah.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      courseTitle: true,
      issuedAt: true,
      issuedBy: true,
      verificationCode: true,
      user: { select: { name: true } },
    },
  });

  if (!certificate || (certificate.userId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "That certificate could not be found" }, { status: 404 });
  }

  const buffer = await renderCertificatePdf({
    studentName: certificate.user.name,
    courseTitle: certificate.courseTitle,
    issuedAt: certificate.issuedAt,
    certificateId: certificate.id,
    teacherName: certificate.issuedBy && certificate.issuedBy !== "SYSTEM" ? certificate.issuedBy : undefined,
  });

  const shortId = certificate.id.slice(-10).toUpperCase();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-MYM-${shortId}.pdf"`,
    },
  });
}
