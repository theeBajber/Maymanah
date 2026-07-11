import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { renderCertificatePdf } from "@/lib/certificate";

// react-pdf reads font files from disk and uses Node.js Buffer APIs —
// this must run on the Node.js runtime, not edge.
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const course = await safeQuery(() =>
      prisma.course.findUnique({
        where: { slug },
        select: { id: true, title: true },
      }),
    );
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollment = await safeQuery(() =>
      prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        select: { status: true, progress: true },
      }),
    );

    const isComplete =
      enrollment?.status === "COMPLETED" || (enrollment?.progress ?? 0) >= 100;

    if (!enrollment || !isComplete) {
      return NextResponse.json(
        { error: "Complete every module in this course to unlock your certificate." },
        { status: 403 },
      );
    }

    // Find-or-create so the certificate ID and issue date stay stable
    // across repeated downloads.
    const ijazah = await safeQuery(() =>
      prisma.ijazah.upsert({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        create: {
          userId: session.user.id,
          courseId: course.id,
          issuedBy: "SYSTEM",
        },
        update: {},
      }),
    );

    if (!ijazah) {
      return NextResponse.json(
        { error: "Could not issue certificate. Please try again." },
        { status: 500 },
      );
    }

    const pdfBuffer = await renderCertificatePdf({
      studentName: session.user.name || "Student",
      courseTitle: course.title,
      issuedAt: ijazah.issuedAt,
      certificateId: ijazah.id,
    });

    const fileName = `Maymanah-Certificate-${course.title.replace(/[^a-z0-9]+/gi, "-")}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
