import { Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { amiri } from "@/app/ui/fonts";
import { GlassCard } from "@/app/ui/glass";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Certificate",
  robots: { index: false, follow: false },
};

/**
 * A certificate as its holder sees it.
 *
 * Only the holder or an administrator may open it; anyone else gets a not
 * found, the same answer the download route gives, so identifiers cannot be
 * probed here. Public checking goes through the verification page.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");

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

  if (!certificate || (certificate.userId !== user.id && user.role !== "ADMIN")) notFound();

  const teacherName =
    certificate.issuedBy && certificate.issuedBy !== "SYSTEM" ? certificate.issuedBy : undefined;

  return (
    <main className="dark night-scene flex min-h-svh items-center justify-center bg-layl-deep px-6 py-12">
      <GlassCard grade="lantern" mashrabiya className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center md:p-10">
        <ShieldCheck className="size-10 text-night-success" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sage">Certificate of completion</p>

        <div className="flex flex-col gap-2">
          <p className={`${amiri.className} text-3xl font-bold text-ivory`}>{certificate.user.name}</p>
          <p className="text-sm text-text-secondary">has completed</p>
          <p className="text-lg font-semibold text-accent">{certificate.courseTitle}</p>
          {teacherName ? <p className="text-xs text-text-muted">Issued by {teacherName}</p> : null}
        </div>

        <dl className="flex w-full flex-col gap-2 border-t border-ivory/10 pt-5 text-left">
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-text-muted">Issued</dt>
            <dd className="text-text-primary">
              {certificate.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-text-muted">Certificate ID</dt>
            <dd className="font-mono text-xs text-text-primary">{certificate.verificationCode}</dd>
          </div>
        </dl>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <a
            href={`/api/certificates/${certificate.id}/pdf`}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-semibold text-text-inverse transition-all hover:brightness-95"
          >
            <Download className="size-4" />
            Download PDF
          </a>
          <Link
            href={`/verify/certificate/${certificate.id}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-ivory/15 text-sm font-semibold text-ivory transition-all hover:border-ivory/25 hover:bg-ivory/5"
          >
            Share for verification
          </Link>
        </div>
      </GlassCard>
    </main>
  );
}
