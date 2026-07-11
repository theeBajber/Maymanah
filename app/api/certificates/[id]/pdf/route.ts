import { NextResponse } from "next/server";
import { prisma, safeQuery } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

    if (certificate.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Decorative border
    page.drawRectangle({
      x: 30, y: 30,
      width: width - 60, height: height - 60,
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 2,
    });
    page.drawRectangle({
      x: 36, y: 36,
      width: width - 72, height: height - 72,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.5,
    });

    // Title
    let y = height - 100;
    page.drawText("CERTIFICATE OF COMPLETION", {
      x: width / 2 - 130,
      y,
      size: 20,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 50;
    page.drawText("Maymanah Institute", {
      x: width / 2 - 60,
      y,
      size: 14,
      font: fontItalic,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Body
    y -= 60;
    page.drawText("This certifies that", {
      x: width / 2 - 55,
      y,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    y -= 40;
    const studentName = certificate.user?.name || "Student";
    page.drawText(studentName, {
      x: width / 2 - (fontBold.widthOfTextAtSize(studentName, 24) / 2),
      y,
      size: 24,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 40;
    page.drawText("has successfully completed the course", {
      x: width / 2 - 110,
      y,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    y -= 40;
    const courseTitle = certificate.course.title;
    page.drawText(courseTitle, {
      x: width / 2 - (fontBold.widthOfTextAtSize(courseTitle, 18) / 2),
      y,
      size: 18,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Date
    y -= 70;
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    page.drawText(`Issued: ${issuedDate}`, {
      x: width / 2 - 50,
      y,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Certificate ID
    y -= 20;
    const certId = certificate.verificationCode || certificate.id.slice(0, 12);
    page.drawText(`Certificate ID: ${certId}`, {
      x: width / 2 - 55,
      y,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Verification note
    y -= 40;
    page.drawText("Verify at: maymanah.org/verify/certificate/" + (certificate.verificationCode || certificate.id), {
      x: width / 2 - 110,
      y,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${certId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Certificate PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
