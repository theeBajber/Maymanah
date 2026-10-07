import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SideNav, TopNav } from "@/app/ui/PortalNav";
import { TopNavProvider } from "@/lib/TopNavContext";
import { auth } from "@/lib/auth";
import { currentLoginSessionId, getCurrentUser, isLoginSessionActive } from "@/lib/session";

export const metadata: Metadata = {
  title: "Portal",
  description: "Your Maymanah dashboard, lessons, and sessions",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  // A cookie can outlive the device it was issued to, so the device record is
  // checked before anything renders.
  if (!(await isLoginSessionActive(currentLoginSessionId(session)))) {
    redirect("/login");
  }

  const user = await getCurrentUser(session);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNavProvider>
        <TopNav />
        <SideNav />
        <main className="md:pl-16 pt-16">
          {user.emailVerified ? null : (
            <div className="border-b border-warning/30 bg-warning/10 px-6 py-2.5 text-center text-sm text-text-secondary">
              Your email address is not confirmed yet.{" "}
              <a href="/settings" className="font-semibold text-primary underline underline-offset-4">
                Confirm it in settings
              </a>{" "}
              so you can recover your account if you lose your password.
            </div>
          )}
          {children}
        </main>
      </TopNavProvider>
    </div>
  );
}