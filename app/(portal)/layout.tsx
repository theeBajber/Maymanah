import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SideNav, TopNav } from "@/components/ui/PortalNav";
import { TopNavProvider } from "@/lib/TopNavContext";
import TeacherChat from "@/components/TeacherChat";

export const metadata: Metadata = {
  title: "Portal",
  description: "Quran learning platform",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("/login");

  const p = await safeQuery(() =>
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
  );
  const hasProfile = !!p;

  if (!hasProfile) {
    redirect("/onboarding");
  }

  if (session.user.role === "ADMIN" || session.user.role === "SUPERADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "TEACHER") {
    const ustadhProfile = await safeQuery(() =>
      prisma.ustadhProfile.findUnique({
        where: { userId: session.user.id },
      })
    );

    if (!ustadhProfile) {
      redirect("/onboarding");
    }

    if (!ustadhProfile.isApproved) {
      if (ustadhProfile.rejectedAt) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-bg-primary">
            <div className="max-w-md text-center p-8">
              <h1 className="text-2xl font-bold text-danger mb-4">
                Application Not Approved
              </h1>
              <p className="text-text-secondary">
                Your teacher application was not approved. You will receive an
                email with more information. If you have questions, please
                contact our support team.
              </p>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary">
          <div className="max-w-md text-center p-8">
            <h1 className="text-2xl font-bold text-primary mb-4">
              Application Under Review
            </h1>
            <p className="text-text-secondary">
              Your application is being reviewed. We&apos;ll email you once
              approved.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNavProvider>
        <TopNav />
        <SideNav />
        <main className="md:pl-16 pt-16">
          {children}
        </main>
        <TeacherChat />
      </TopNavProvider>
    </div>
  );
}
