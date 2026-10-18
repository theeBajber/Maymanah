import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ReportForm } from "./ReportForm";

export const metadata: Metadata = { title: "Report an Issue" };

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function ReportPage({ searchParams }: Props) {
  const user = await getCurrentUser(await auth());
  const { userId } = await searchParams;

  let reportedUserName = "";
  if (userId) {
    const reported = await db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    reportedUserName = reported?.name ?? "";
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Report an Issue</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Help us keep the community safe. Your report will be reviewed by our team.
        </p>
      </div>
      <ReportForm
        reporterName={user?.name ?? ""}
        reporterEmail={user?.email ?? ""}
        initialUserId={userId ?? ""}
        initialUserName={reportedUserName}
      />
    </div>
  );
}
