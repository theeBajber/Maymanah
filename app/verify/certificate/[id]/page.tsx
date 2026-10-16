import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { amiri } from "@/app/ui/fonts";
import { GlassCard } from "@/app/ui/glass";
import { verifyCertificate } from "@/lib/certificate";

export const metadata: Metadata = {
  title: "Verify certificate",
  robots: { index: false, follow: false },
};

/**
 * Public certificate check.
 *
 * Reached as a link, so verification happens when the link is followed rather
 * than on a form submit. Shows only what is printed on the certificate
 * itself: the name, the course, the date, and whether it is authentic.
 */
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certificate = await verifyCertificate(id);

  if (!certificate) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-layl-deep px-6">
        <GlassCard className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
          <XCircle className="size-9 text-night-danger" />
          <h1 className="text-xl font-bold text-text-primary">Certificate not found</h1>
          <p className="text-sm text-text-secondary">
            Nothing matches that reference. Check the link for typos, or ask the holder for another.
          </p>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-[10px] bg-brass px-6 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
          >
            Back to home
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-layl-deep px-6 py-12">
      <GlassCard grade="lantern" mashrabiya className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center md:p-10">
        <ShieldCheck className="size-10 text-night-success" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sage">Verified</p>
        <p className="text-sm text-text-secondary">This certificate was issued by Maymanah</p>

        <div className="flex flex-col gap-2">
          <CheckCircle2 className="mx-auto size-6 text-night-success" />
          <p className={`${amiri.className} text-2xl font-bold text-ivory`}>{certificate.studentName}</p>
          <p className="text-sm text-text-secondary">completed</p>
          <p className="text-lg font-semibold text-brass">{certificate.courseTitle}</p>
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
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-text-muted">Status</dt>
            <dd className={certificate.isVerified ? "font-semibold text-night-success" : "font-semibold text-warning"}>
              {certificate.isVerified ? "Authentic" : "Pending"}
            </dd>
          </div>
        </dl>

        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-[10px] bg-brass px-6 text-sm font-semibold text-layl-deep transition-all hover:bg-[#D2AF6B]"
        >
          Back to home
        </Link>
      </GlassCard>
    </main>
  );
}
