import { prisma, safeQuery } from "@/lib/prisma";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faShield, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { amiri } from "@/components/ui/fonts";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try to find by verification code first, then by ID
  let certificate = await safeQuery(() =>
    prisma.ijazah.findUnique({
      where: { verificationCode: id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  );

  if (!certificate) {
    certificate = await safeQuery(() =>
      prisma.ijazah.findUnique({
        where: { id },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-secondary flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-bg-card border border-border rounded-2xl p-8 text-center">
          <div className="size-16 rounded-full bg-danger-muted flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faTimesCircle} className="size-6 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Certificate Not Found</h2>
          <p className="text-sm text-text-secondary">
            No certificate was found with the provided ID or verification code.
          </p>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-elevated to-bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="size-16 rounded-full bg-bg-card border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FontAwesomeIcon icon={faSearch} className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Certificate Verification</h1>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-8 rounded-full bg-success-muted flex items-center justify-center">
              <FontAwesomeIcon icon={faShield} className="size-4 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success text-sm">Verified</p>
              <p className="text-xs text-text-muted">
                This certificate was issued by Maymanah Institute
              </p>
            </div>
          </div>

          <div className="text-center py-6 border-y border-border mb-6">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faAward} className="size-6 text-primary" />
            </div>
            <h2 className={`${amiri.className} text-2xl font-bold text-text-primary mb-1`}>
              {certificate.user.name || "Student"}
            </h2>
            <p className="text-text-secondary text-sm mb-1">completed</p>
            <h3 className={`${amiri.className} text-xl font-semibold text-text-primary`}>
              {certificate.course.title}
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Issued</span>
              <span className="text-text-primary font-medium">{issuedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Certificate ID</span>
              <span className="text-text-primary font-mono text-xs">
                {certificate.verificationCode || certificate.id.slice(0, 12)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <span className="text-success font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faShield} className="size-3" />
                {certificate.isVerified ? "Authentic" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
