import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportForm } from "./ReportForm";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function ReportPage({ searchParams }: Props) {
  const session = await auth();
  const { userId } = await searchParams;

  let reportedUserName = "";
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    reportedUserName = user?.name ?? "";
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Report an Issue</h1>
        <p className="text-sm text-text-secondary mt-1">
          Help us keep the community safe. Your report will be reviewed by our team.
        </p>
      </div>
      <ReportForm
        reporterName={session?.user?.name ?? ""}
        reporterEmail={session?.user?.email ?? ""}
        reporterRole={session?.user?.role ?? "STUDENT"}
        initialUserId={userId ?? ""}
        initialUserName={reportedUserName}
      />
    </div>
  );
}
