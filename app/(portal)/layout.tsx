import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SideNav, TopNav } from "@/components/ui/PortalNav";
import { TopNavProvider } from "@/lib/TopNavContext";

export const metadata: Metadata = {
  title: "Maymanah - Portal",
  description: "Quran learning platform",
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("/login");

  let hasProfile = false;
  try {
    const p = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    hasProfile = !!p;
  } catch {
    // Profile table might not exist; allow through
  }

  if (!hasProfile) {
    redirect("/onboarding");
  }

  if (session.user.role === "ADMIN" || session.user.role === "SUPERADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "TEACHER") {
    let profile;
    try {
      profile = await prisma.ustadhProfile.findUnique({
        where: { userId: session.user.id },
      });
    } catch {
      // Table doesn't exist yet (pre-migration) — treat as unapproved
    }

    if (!profile?.isApproved) {
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
      </TopNavProvider>
    </div>
  );
}
