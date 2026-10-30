import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { currentLoginSessionId, getCurrentUser, isLoginSessionActive } from "@/lib/session";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session) redirect("/login");

  // A cookie can outlive the device it was issued to, so the device record is
  // checked before any admin surface renders.
  if (!(await isLoginSessionActive(currentLoginSessionId(session)))) redirect("/login");

  const user = await getCurrentUser(session);
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const pendingApprovals = await db.ustadhProfile.count({ where: { isApproved: false, rejectedAt: null } });

  return (
    <div className="min-h-screen bg-bg-primary">
      <AdminTopBar user={user} pendingApprovals={pendingApprovals} />
      <AdminSidebar />
      <main className="pt-16 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pl-16 md:pb-0">
        <div className="max-w-screen-2xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
