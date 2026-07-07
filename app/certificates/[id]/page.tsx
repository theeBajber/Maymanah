import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faShield, faDownload } from "@fortawesome/free-solid-svg-icons";
import { amiri } from "@/components/ui/fonts";

export const dynamic = "force-dynamic";

export default async function CertificateViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const certificate = await safeQuery(() =>
    prisma.ijazah.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  );

  if (!certificate) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === certificate.userId;

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="relative bg-bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Decorative borders */}
          <div className="absolute inset-0 border-[6px] border-primary/10 rounded-2xl pointer-events-none" />
          <div className="absolute inset-[12px] border border-primary/5 rounded-xl pointer-events-none" />

          {/* Header ornament */}
          <div className="text-center pt-12 pb-2">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faAward} className="size-8 text-primary" />
            </div>
            <h1 className={`${amiri.className} text-4xl font-bold text-primary mb-2`}>
              Certificate of Completion
            </h1>
            <p className="text-text-muted text-sm">Maymanah Institute</p>
          </div>

          {/* Body */}
          <div className="px-12 py-8 text-center">
            <p className="text-text-secondary text-sm mb-2">This certifies that</p>
            <h2 className={`${amiri.className} text-3xl font-bold text-text-primary mb-4`}>
              {certificate.user.name || "Student"}
            </h2>
            <p className="text-text-secondary text-sm mb-1">has successfully completed the course</p>
            <h3 className={`${amiri.className} text-2xl font-semibold text-text-primary mb-6`}>
              {certificate.course.title}
            </h3>

            <div className="flex items-center justify-center gap-8 text-xs text-text-muted mb-8">
              <span>Issued: {issuedDate}</span>
              {certificate.verificationCode && (
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faShield} className="size-3 text-success" />
                  Verified
                </span>
              )}
              <span>ID: {certificate.verificationCode || certificate.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-12 py-4 flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Verify at maymanah.org/verify/certificate/{certificate.verificationCode || certificate.id}
            </p>
            {isOwner && (
              <a
                href={`/api/certificates/${certificate.id}/pdf`}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-text-inverse text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} className="size-3" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
