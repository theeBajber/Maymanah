import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderCertificatePdf } from "@/lib/certificate-pdf";

// react-pdf reads font files from disk and uses Node.js Buffer APIs
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const certificate = await safeQuery(() =>
      prisma.ijazah.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true } },
          course: { select: { title: true } },
        },
      }),
    );

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (
      certificate.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacherName =
      certificate.issuedBy && certificate.issuedBy !== "SYSTEM"
        ? certificate.issuedBy
        : undefined;

    const pdfBuffer = await renderCertificatePdf({
      studentName: certificate.user.name || "Student",
      courseTitle: certificate.course.title,
      issuedAt: certificate.issuedAt,
      certificateId: certificate.id,
      teacherName,
    });

    const certId = certificate.id.slice(-10).toUpperCase();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-MYM-${certId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Certificate PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
