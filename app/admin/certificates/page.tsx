import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faDownload } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  await requireAdmin();

  const certificates = await safeQuery(() =>
    prisma.ijazah.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Certificates</h1>
          <p className="text-text-secondary mt-1">
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} issued
          </p>
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-secondary/50">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Student
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Course
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Issued
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {certificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-bg-hover/50 transition-colors">
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {cert.user.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{cert.user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm text-text-primary">{cert.course.title}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm text-text-secondary">
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      cert.isVerified
                        ? "bg-success-muted text-success"
                        : "bg-warning-muted text-warning"
                    }`}
                  >
                    <FontAwesomeIcon icon={faAward} className="size-3" />
                    {cert.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/certificates/${cert.id}`}
                      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                      title="View Certificate"
                    >
                      <FontAwesomeIcon icon={faDownload} className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                  <FontAwesomeIcon icon={faAward} className="size-8 mx-auto mb-3 text-text-muted" />
                  <p className="font-medium">No certificates issued yet</p>
                  <p className="text-sm text-text-muted mt-1">
                    Certificates are auto-issued when students pass the final exam
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
