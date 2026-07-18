import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { elMessiri } from "@/components/ui/fonts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${className}`}>
      <path
        d="M8,0 L16,8 L8,16 L0,8 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

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
        course: { select: { title: true, slug: true } },
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

  const shortId = certificate.id.slice(-10).toUpperCase();

  const teacherName =
    certificate.issuedBy && certificate.issuedBy !== "SYSTEM"
      ? certificate.issuedBy
      : undefined;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Certificate */}
        <div className="relative bg-[#FBF8F1] rounded-sm shadow-2xl overflow-hidden">
          {/* Outer border */}
          <div className="absolute inset-0 border-[3px] border-[#8A6A34] pointer-events-none" />
          {/* Inner border */}
          <div className="absolute inset-[8px] border border-[#C6A15B] pointer-events-none" />

          {/* Corner diamonds */}
          <Diamond className="absolute top-5 left-5 text-[#8A6A34]" />
          <Diamond className="absolute top-5 right-5 text-[#8A6A34]" />
          <Diamond className="absolute bottom-5 left-5 text-[#8A6A34]" />
          <Diamond className="absolute bottom-5 right-5 text-[#8A6A34]" />

          {/* Content */}
          <div className="relative px-20 py-16 flex flex-col items-center text-center">
            {/* Eyebrow */}
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#8A6A34] mb-4">
              A Global Quranic Sanctuary
            </p>

            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <Diamond className="text-[#8A6A34]" />
              <span className={`${elMessiri.className} text-xl font-semibold tracking-wider text-[#0B151B]`}>
                Maymanah
              </span>
            </div>

            {/* Title */}
            <h1 className={`${elMessiri.className} text-4xl font-bold text-[#0B151B] mb-3`}>
              Certificate of Completion
            </h1>

            {/* Subtitle */}
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#4B5A5D] mb-8">
              Issued in recognition of dedicated study
            </p>

            {/* Body */}
            <p className="text-sm text-[#4B5A5D] mb-3">This certifies that</p>

            <h2 className={`${elMessiri.className} text-[2rem] font-bold text-[#8A6A34] mb-3`}>
              {certificate.user.name || "Student"}
            </h2>

            <div className="w-56 h-px bg-[#C6A15B] mb-5" />

            <p className="text-[13px] text-[#0B151B] mb-2">
              has successfully completed the course
            </p>

            <p className={`${elMessiri.className} text-lg font-semibold text-[#0B151B] mb-2`}>
              {certificate.course.title}
            </p>

            {teacherName && (
              <p className="text-[11px] text-[#4B5A5D] mb-4">
                Under the guidance of{" "}
                <span className={`${elMessiri.className} font-semibold text-[#8A6A34]`}>
                  {teacherName}
                </span>
              </p>
            )}

            {/* Footer row */}
            <div className="flex items-start justify-between w-full max-w-lg mt-6">
              {/* Date */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#0B151B] mb-1">{issuedDate}</span>
                <div className="w-32 h-px bg-[#4B5A5D] mb-1.5" />
                <span className="text-[8px] tracking-[0.2em] uppercase text-[#4B5A5D]">
                  Date Issued
                </span>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center -mt-1">
                <svg viewBox="0 0 44 44" className="size-10">
                  <path
                    d="M22,4 L40,22 L22,40 L4,22 Z"
                    fill="none"
                    stroke="#8A6A34"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M22,12 L32,22 L22,32 L12,22 Z"
                    fill="none"
                    stroke="#C6A15B"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Certificate ID */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#0B151B] mb-1">MYM-{shortId}</span>
                <div className="w-32 h-px bg-[#4B5A5D] mb-1.5" />
                <span className="text-[8px] tracking-[0.2em] uppercase text-[#4B5A5D]">
                  Certificate ID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        {isOwner && (
          <div className="mt-6 flex justify-center">
            <a
              href={`/api/courses/${certificate.course.slug}/certificate`}
              download
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-text-inverse text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} className="size-3.5" />
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
